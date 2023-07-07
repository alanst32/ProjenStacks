import { EventBridgeEventScheduleStore, EventBridgeEventScheduleStoreProps } from './eb-event-schedule-store';
import { log } from '../../log';
import { Event, EventStore } from '../types';

export type EventBridgeEventScheduleHandlerProps = {
    eventStore: EventStore;
};

/**
 * The lambda handler that is responsible for publishing the scheduled events on receive.
 * This lambda must be granted the event dispatcher's put/publish event permission.
 * @param props EventBridgeEventScheduleHandlerProps
 * @returns The lambda handler.
 */
export const EventBridgeEventScheduleHandler = (props: EventBridgeEventScheduleHandlerProps) => {
    const { eventStore } = props;
    const scheduleStore = EventBridgeEventScheduleStore(EventBridgeEventScheduleStoreProps());

    return async (event: Event) => {
        log.debug({ event }, 'Received scheduled event');

        await eventStore.publish(event);
        const scheduleName = event.context?.scheduleName;

        if (!scheduleName) {
            return log.warn({ entity: event.entity, type: event.type }, 'Event does not have scheduleName');
        }

        await scheduleStore.remove(scheduleName.toString());
    };
};
