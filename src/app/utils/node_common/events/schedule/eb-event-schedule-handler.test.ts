/* eslint-disable import/order */
import { mock } from 'jest-mock-extended';
import { mockLog } from '../../log/log.mock';
import { EventStore, Event } from '../types';
import { EventBridgeEventScheduleHandler } from './eb-event-schedule-handler';

const mockRemove = jest.fn();

jest.mock('./eb-event-schedule-store', () => ({
    ...jest.requireActual('./eb-event-schedule-store'),
    EventBridgeEventScheduleStore: () => ({ remove: mockRemove }),
}));

describe('EventBridgeEventScheduleHandler', () => {
    const eventStore = mock<EventStore>();
    const handler = EventBridgeEventScheduleHandler({ eventStore });

    const event: Event = {
        type: 'document:created',
        entity: { id: '123', type: 'document' },
        payload: { title: 'My document' },
    };

    it('publishes event and removes schedule', async () => {
        const anEvent = { ...event, context: { scheduleName: 'event-schedule' } };
        await handler(anEvent);
        expect(mockRemove).toBeCalledWith('event-schedule');
        expect(eventStore.publish).toBeCalledWith(anEvent);
    });

    it('publishes event and warn when scheduleName is not available', async () => {
        await handler(event);
        expect(mockRemove).not.toBeCalled();
        expect(eventStore.publish).toBeCalledWith(event);
        expect(mockLog.warn).toBeCalledWith(
            { entity: { id: '123', type: 'document' }, type: 'document:created' },
            'Event does not have scheduleName'
        );
    });
});
