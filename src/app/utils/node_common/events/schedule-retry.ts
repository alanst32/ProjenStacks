import { SQS } from 'aws-sdk';
import { FailureStore } from './failure-store';
import { EventReceiptStore } from './receipt-store';
import { Context, Entity, Event, EventType, FunctionEventKey, Payload, PublishedEvent } from './types';
import { log } from '../log';
import { withErrorCheck } from '../aws/utils';

type Config = {
    receiptStore: EventReceiptStore;
    failureStore: FailureStore;
    retryQueueUrl: string;
    retryAttempt: number;
};

/**
 * @hidden
 * @internal
 */
export type ScheduleRetryRequest<T extends EventType = EventType, P extends Payload = Payload> = {
    key: FunctionEventKey;
    published: PublishedEvent<Event<T, P>>;
    error: Error;
    onMaxRetryReached?: OnMaxRetryReached;
};

/**
 * The function to execute once the maximum retry attempt is reached.
 */
export type OnMaxRetryReached = (params: {
    entity: Entity;
    message: string;
    retried: number;
    context?: Context;
}) => void | Promise<void>;

export type ScheduleRetry = (request: ScheduleRetryRequest) => Promise<void>;

/**
 * Used to schedule retry of a failed handling of an event.
 * @internal
 * @hidden
 */
export const ScheduleRetry = (config: Config): ScheduleRetry => {
    const sqs = new SQS();
    const { receiptStore, failureStore, retryQueueUrl, retryAttempt } = config;

    return async ({ key, published, error, onMaxRetryReached }) => {
        const maxRetryAttempt = retryAttempt <= 10 ? retryAttempt : 10;
        const failures = await failureStore.get(key);

        if (failures.length >= maxRetryAttempt) {
            log.warn({ key, maxRetryAttempt }, 'Max retry attempt reached');
            if (onMaxRetryReached) {
                await onMaxRetryReached({
                    entity: published.entity,
                    message: error.message,
                    retried: maxRetryAttempt,
                    context: published.context,
                });
            }
            return;
        }

        // exponential backoff delay - set max to 900s due to SQS delay limit
        const delay = Math.pow(4, failures.length + 1);
        const limitedDelay = delay > 900 ? 900 : delay;

        await Promise.all([
            receiptStore.remove(key), // so that it can be retried
            failureStore.add(key, error.message),
            withErrorCheck(
                sqs.sendMessage({
                    QueueUrl: retryQueueUrl,
                    MessageBody: JSON.stringify(published),
                    DelaySeconds: limitedDelay,
                }),
                'Failed sending retry SQS message'
            ),
        ]);
    };
};
