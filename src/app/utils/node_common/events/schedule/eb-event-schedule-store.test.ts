/* eslint-disable import/order */
import { mockLog } from '../../log/log.mock';
import { Event } from '../types';

const mockCreateSchedule = jest.fn().mockImplementation(() => ({
  promise: () => ({ $response: { error: undefined } }),
}));

const mockDeleteSchedule = jest.fn().mockImplementation(() => ({
  promise: () => ({ $response: { error: undefined } }),
}));

jest.mock('aws-sdk', () => ({
  Scheduler: class {
    createSchedule = mockCreateSchedule;
    deleteSchedule = mockDeleteSchedule;
  },
}));

jest.mock('ulid', () => ({ ulid: jest.fn().mockReturnValue('ULID') }));

import { EventBridgeEventScheduleStore, EventBridgeEventScheduleStoreProps } from './eb-event-schedule-store';

describe('EventBridgeEventScheduleStore', () => {
  const store = EventBridgeEventScheduleStore(EventBridgeEventScheduleStoreProps());

  const event: Event = {
    type: 'document:created',
    entity: { id: '123', type: 'document' },
    payload: { title: 'My document' },
  };

  it('adds event to schedule', async () => {
    await store.add({ minutesLater: 60, event });

    expect(mockCreateSchedule).toBeCalledWith({
      FlexibleTimeWindow: { Mode: 'OFF' },
      GroupName: 'MISSING:SCHEDULE_GROUP_NAME',
      Name: 'entity-event-schedule-ULID',
      ScheduleExpression: expect.stringMatching(/at\(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\)/),
      ScheduleExpressionTimezone: 'UTC',
      Target: {
        Arn: 'MISSING:SCHEDULE_HANDLER_ARN',
        Input: JSON.stringify({
          type: 'document:created',
          entity: { id: '123', type: 'document' },
          payload: { title: 'My document' },
          context: { scheduleName: 'entity-event-schedule-ULID' },
        }),
        RoleArn: 'MISSING:SCHEDULER_ROLE_ARN',
      },
    });

    expect(mockLog.info).toBeCalledWith(
      {
        entity: { id: '123', type: 'document' },
        time: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        type: 'document:created',
      },
      'Scheduled entity event'
    );
  });

  it('removes schedule', async () => {
    await store.remove('schedule-id');
    expect(mockDeleteSchedule).toBeCalledWith({
      GroupName: 'MISSING:SCHEDULE_GROUP_NAME',
      Name: 'schedule-id',
    });
  });
});
