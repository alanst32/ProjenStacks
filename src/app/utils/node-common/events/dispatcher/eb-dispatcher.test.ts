/* eslint-disable import/order */
import { mockBridgePutEvents } from '../../aws/mocks/event-bridge.mock';
import { EventBridgeDispatcher } from './eb-dispatcher';
import { PublishedEvent } from '../types';

describe('EventBridgeDispatcher', () => {
  it('dispatches event to EventBridge', async () => {
    const published: PublishedEvent = {
      id: 'event-id',
      type: 'transaction:test-event',
      payload: { abc: '123' },
      entity: { id: '1', type: 'transaction' },
      timestamp: '2022-09-19T00:01:01.000',
    };

    await EventBridgeDispatcher('my-stack').dispatch(published);

    expect(mockBridgePutEvents).toHaveBeenCalledWith({
      Entries: [
        {
          Detail: JSON.stringify(published),
          DetailType: 'transaction:test-event',
          EventBusName: 'my-stack-events',
          Source: 'au.gov.vic.service.my-stack',
        },
      ],
    });
  });
});
