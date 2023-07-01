import { SNS } from 'aws-sdk';
import { withErrorCheck } from '../../aws/utils';
import { log } from '../../log';
import { Dispatcher, PublishedEvent } from '../types';
import { stringifyEvent } from '../utils';

type Props = { topicArn: string };

/**
 * Event dispatcher using EventBridge
 * @param stackName The stack name for event source identification.
 * @returns The dipatcher object.
 * @hidden
 */
export const SnsDispatcher = (props: Props): Dispatcher => {
  const sns = new SNS();

  return {
    dispatch: async (event: PublishedEvent) => {
      log.debug({ event }, 'Dispatching event...');

      await withErrorCheck(
        sns.publish({
          TopicArn: props.topicArn,
          Message: stringifyEvent(event),
          MessageAttributes: {
            eventType: { DataType: 'String', StringValue: event.type },
          },
        }),
        'Failed dispatching event'
      );

      log.debug({ id: event.id }, 'Event dispatched');

      const { id, type, entity, context } = event;
      log.metric({ name: 'event-dispatched', id, type, entity, context });
    },
  };
};
