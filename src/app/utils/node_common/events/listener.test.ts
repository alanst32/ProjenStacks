/* eslint-disable import/order */
import { mockLog } from '../log/log.mock';
import { NoRetryError, ReceiptError } from './error';

const receiptStoreRemove = jest.fn();
const otherError = new Error('some-other-error');
const noRetryError = new NoRetryError('no-retry-error');

jest.mock('./receipt-store', () => ({
  DynEventReceiptStore: () => ({
    remove: receiptStoreRemove,
    keep: async ({ id }: any) => {
      switch (id) {
        case '111':
          throw new ReceiptError('receipt-error');
        case '222':
          throw otherError;
      }
    },
  }),
}));

const mockScheduleRetry = jest.fn();
jest.mock('./schedule-retry', () => ({
  ScheduleRetry: jest.fn().mockReturnValue(mockScheduleRetry),
}));

import { Event } from '.';
import { PublishedEvent } from './types';

describe('aws/events/listener', () => {
  const mockListener = jest.fn().mockReturnValue(Promise.resolve());
  const timestamp = '2022-05-19T06:25:31.705Z';
  const handler = Event.addListener(mockListener);

  const rawEbEvent = (pubEvent: any) => ({
    id: '123',
    time: timestamp,
    'detail-type': 'transaction:test-event',
    source: 'test-source',
    detail: pubEvent,
    version: '1',
    account: 'test-account',
    region: 'ap-southeast-2',
    resources: [],
  });

  const rawSnsEvent = (pubEvent: any) => ({
    Records: [{ Sns: { Message: JSON.stringify(pubEvent) } }],
  });

  it('invokes listener when it has not been processed', async () => {
    const pubEvent: PublishedEvent = {
      id: '123',
      type: 'transaction:test-event',
      entity: { id: '1', type: 'transaction' },
      timestamp,
      payload: { aaa: 'bbb' },
    };

    await handler(rawEbEvent(pubEvent) as any);
    expect(mockListener).toHaveBeenCalledWith(pubEvent);
  });

  it('invokes listener when it has not been processed with raw SNS event', async () => {
    const pubEvent: PublishedEvent = {
      id: '123',
      type: 'transaction:test-event',
      entity: { id: '1', type: 'transaction' },
      timestamp,
      payload: { aaa: 'bbb' },
    };

    await handler(rawSnsEvent(pubEvent) as any);
    expect(mockListener).toHaveBeenCalledWith(pubEvent);
  });

  it('does not invoke listener when it has been processed', async () => {
    const pubEvent: PublishedEvent = {
      id: '111',
      type: 'transaction:test-event',
      entity: { id: '1', type: 'transaction' },
      timestamp,
      payload: { aaa: 'bbb' },
    };

    await handler(rawEbEvent(pubEvent) as any);
    expect(mockListener).not.toHaveBeenCalled();
    expect(mockLog.error).not.toHaveBeenCalled();
    expect(mockLog.warn).toHaveBeenCalledWith(
      {
        receiptKey: { functionName: 'MISSING:AWS_LAMBDA_FUNCTION_NAME', id: '111' },
      },
      'Event skipped - receipt-error'
    );
  });

  it('logs error and calls scheduleRetry when it is not a receipt error', async () => {
    const pubEvent: PublishedEvent = {
      id: '222',
      type: 'transaction:test-event',
      entity: { id: '1', type: 'transaction' },
      timestamp,
      payload: { aaa: 'bbb' },
    };

    await handler(rawEbEvent(pubEvent) as any);

    expect(mockListener).not.toHaveBeenCalled();
    expect(mockLog.error).toHaveBeenCalledWith('Failed processing event: some-other-error');
    expect(mockScheduleRetry).toHaveBeenCalledWith({
      published: {
        entity: { id: '1', type: 'transaction' },
        id: '222',
        payload: { aaa: 'bbb' },
        timestamp: '2022-05-19T06:25:31.705Z',
        type: 'transaction:test-event',
      },
      key: {
        functionName: 'MISSING:AWS_LAMBDA_FUNCTION_NAME',
        id: '222',
      },
      error: otherError,
    });
  });

  it('logs error and does not retry when it is a NoRetry error', async () => {
    const pubEvent: PublishedEvent = {
      id: '333',
      type: 'transaction:test-event',
      entity: { id: '1', type: 'transaction' },
      timestamp,
      payload: { aaa: 'bbb' },
    };

    mockListener.mockImplementation(() => Promise.reject(noRetryError));
    await handler(rawEbEvent(pubEvent) as any);

    expect(mockListener).toBeCalledWith(pubEvent);
    expect(mockLog.error).toHaveBeenCalledWith('Non-retriable error: no-retry-error');
    expect(mockScheduleRetry).not.toBeCalled();
  });
});
