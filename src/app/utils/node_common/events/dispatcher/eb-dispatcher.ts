import { EventBridge } from 'aws-sdk';
import { withErrorCheck } from '../../aws/utils/utils';
import { log } from '../../log';
import { Dispatcher, PublishedEvent } from '../types';
import { stringifyEvent } from '../utils';

/**
 * Event dispatcher using EventBridge
 * @param stackName The stack name for event source identification.
 * @param sourcePrefix Prefix of the Event sources, for this project pattern follow `com.rosterfy.community-<stack-name>`
 * @returns The dipatcher object.
 * @hidden
 */
export const EventBridgeDispatcher = (stackName: string, sourcePrefix: string): Dispatcher => {
  const bridge = new EventBridge();

  return {
    dispatch: async (event: PublishedEvent) => {
      log.trace({ event }, 'Dispatching event...');

      await withErrorCheck(
        bridge.putEvents({
          Entries: [
            {
              EventBusName: `${stackName}-events`,
              Source: `${sourcePrefix}-${stackName}`,
              DetailType: event.type,
              Detail: stringifyEvent(event),
            },
          ],
        }),
        'Failed dispatching event'
      );

      log.debug({ event }, 'Event dispatched');

      const { id, type, entity, context } = event;
      log.metric({ name: 'event-dispatched', id, type, entity, context });
    },
  };
};
