import { EventBridgeEvent, SNSEvent } from 'aws-lambda';
import { NoRetryError, ReceiptError } from './error';
import { EventReceiptStore } from './receipt-store';
import { OnMaxRetryReached, ScheduleRetry } from './schedule-retry';
import { Event, EventListener, EventType, Payload, PublishedEvent } from './types';
import { log } from '../log';

type Config = {
    receiptStore: EventReceiptStore;
    scheduleRetry: ScheduleRetry;
};

/**
 * Attach an EventListener as an EventBridge or SNS event handler.
 */
export type AddListener = <T extends EventType = EventType, P extends Payload = Payload>(
    listener: EventListener<PublishedEvent<Event<T, P>>>,
    onMaxRetryReached?: OnMaxRetryReached
) => <E extends EventBridgeEvent<T, P> | SNSEvent>(event: E) => Promise<void>;

export const AddListener = (config: Config): AddListener => {
    const isSNSEvent = (event: any): event is SNSEvent => !!event.Records;
    const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME || 'MISSING:AWS_LAMBDA_FUNCTION_NAME';
    const { scheduleRetry, receiptStore } = config;

    return (listener, onMaxRetryReached) => async event => {
        const published = isSNSEvent(event) ? JSON.parse(event.Records[0].Sns.Message) : event.detail;
        log.debug({ published }, 'Received published event');

        const key = { id: published.id, functionName };

        try {
            await receiptStore.keep(key);
            await listener(published);
        } catch (error: any) {
            if (error instanceof ReceiptError) {
                return log.warn({ receiptKey: key }, `Event skipped - ${error.message}`);
            } else if (error instanceof NoRetryError) {
                return log.error(`Non-retriable error: ${error.message}`);
            }

            log.error(`Failed processing event: ${error.message}`);
            await scheduleRetry({ key, published, error, onMaxRetryReached });
        }
    };
};
