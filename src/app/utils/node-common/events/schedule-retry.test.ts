/* eslint-disable import/order */
import { mock } from 'jest-mock-extended';
import { mockSqsSendMessage } from '../aws/mocks/sqs.mock';
import { FailureStore } from './failure-store';
import { EventReceiptStore } from './receipt-store';
import { ScheduleRetry } from './schedule-retry';
import { Entity, Event as BaseEvent, PublishedEvent as BasePublishedEvent } from './types';
import { AsEvent } from './utils';

export const asEntity = (id: string): Entity => ({ id, type: 'entity' });

export namespace EntityActioned {
  export type Type = 'entity:actioned';
  export const type: Type = 'entity:actioned';
  export type Payload = { source: string };
  export type Event = BaseEvent<Type, Payload>;
  export type PublishedEvent = BasePublishedEvent<Event>;
  export const asEvent = AsEvent<Event>(type, asEntity);
}

const published: EntityActioned.PublishedEvent = {
  entity: {
    id: '123',
    type: 'entity',
  },
  type: EntityActioned.type,
  payload: {
    source: 'abc',
  },
  context: { clientId: 'test-client' },
  id: 'event-id',
  timestamp: '2023-06-14T03:55:48.380Z',
};

describe('Schedule Retry', () => {
  const noFailureKey = { id: '000', functionName: 'function-1' };
  const sixFailureKey = { id: '666', functionName: 'function-2' };
  const tenFailureKey = { id: '100', functionName: 'function-3' };
  const mockOnMaxRetryReached = jest.fn();
  const receiptStore = mock<EventReceiptStore>();

  const failureStore = mock<FailureStore>({
    get: jest.fn().mockImplementation(key => {
      const createFailures = (length: number) =>
        new Array(length).fill(0).map((_, i) => ({
          timestamp: new Date().toISOString(),
          message: `error-${i + 1}`,
        }));

      switch (key.id) {
        default:
        case '123':
          return [];
        case '666':
          return createFailures(6);
        case '100':
          return createFailures(10);
      }
    }),
  });

  const scheduleRetry = ScheduleRetry({
    failureStore,
    receiptStore,
    retryQueueUrl: 'retry-queue-url',
    retryAttempt: 8,
  });

  it('schedules retry when attempt number is not maxed', async () => {
    await scheduleRetry({ key: noFailureKey, published, error: new Error('some-error') });
    expect(failureStore.get).toHaveBeenCalledWith(noFailureKey);
    expect(receiptStore.remove).toHaveBeenCalledWith(noFailureKey);
    expect(mockSqsSendMessage).toHaveBeenCalledWith({
      DelaySeconds: 4,
      MessageBody: JSON.stringify(published),
      QueueUrl: 'retry-queue-url',
    });
  });

  it('sets delay to an exponent of number of failures', async () => {
    await scheduleRetry({ key: sixFailureKey, published, error: new Error('some-error') });
    expect(failureStore.get).toHaveBeenCalledWith(sixFailureKey);
    expect(receiptStore.remove).toHaveBeenCalledWith(sixFailureKey);
    expect(mockSqsSendMessage).toHaveBeenCalledWith({
      DelaySeconds: 900,
      MessageBody: JSON.stringify(published),
      QueueUrl: 'retry-queue-url',
    });
  });

  it('does not allow retry when maxRetryAttempt is reached', async () => {
    await scheduleRetry({
      key: tenFailureKey,
      published,
      error: new Error('some-error'),
      onMaxRetryReached: mockOnMaxRetryReached,
    });
    expect(failureStore.get).toHaveBeenCalledWith(tenFailureKey);
    expect(receiptStore.remove).not.toHaveBeenCalled();
    expect(mockSqsSendMessage).not.toHaveBeenCalled();
    expect(mockOnMaxRetryReached).toHaveBeenCalledWith({
      entity: {
        id: '123',
        type: 'entity',
      },
      context: { clientId: 'test-client' },
      message: 'some-error',
      retried: 8,
    });
  });
});
