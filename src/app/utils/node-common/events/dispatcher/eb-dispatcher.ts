import { EventBridge } from 'aws-sdk';
import { withErrorCheck } from '../../aws/utils';
import { log } from '../../log';
import { Dispatcher, PublishedEvent } from '../types';
import { stringifyEvent } from '../utils';

/**
 * Event dispatcher using EventBridge
 * @param stackName The stack name for event source identification.
 * @returns The dipatcher object.
 * @hidden
 */
export const EventBridgeDispatcher = (stackName: string): Dispatcher => {
  const bridge = new EventBridge();

  return {
    dispatch: async (event: PublishedEvent) => {
      log.trace({ event }, 'Dispatching event...');

      await withErrorCheck(
        bridge.putEvents({
          Entries: [
            {
              EventBusName: `${stackName}-events`,
              Source: `au.gov.vic.service.${stackName}`,
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
