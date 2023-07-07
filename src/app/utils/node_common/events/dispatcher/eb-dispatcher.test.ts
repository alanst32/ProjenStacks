/* eslint-disable import/order */
// import { EventBridgeDispatcher } from './eb-dispatcher';
// import { PublishedEvent } from '../types';
// import { mockBridgePutEvents } from '../../mocks/event-bridge.mock';

describe('EventBridgeDispatcher', () => {
  // it('dispatches event to EventBridge', async () => {
  //     const published: PublishedEvent = {
  //         id: 'event-id',
  //         type: 'transaction:test-event',
  //         payload: { abc: '123' },
  //         entity: { id: '1', type: 'transaction' },
  //         timestamp: '2022-09-19T00:01:01.000',
  //     };

  //     await EventBridgeDispatcher('my-stack', 'com.rosterfy.community').dispatch(published);

  //     expect(mockBridgePutEvents).toHaveBeenCalledWith({
  //         Entries: [
  //             {
  //                 Detail: JSON.stringify(published),
  //                 DetailType: 'transaction:test-event',
  //                 EventBusName: 'my-stack-events',
  //                 Source: 'com.rosterfy.community.my-stack',
  //             },
  //         ],
  //     });
  // });
  // TODO that requires Account Configuration (Keys) - Do that after proper accoutns are set
  it('todo test', () => {
    expect(true).toBeTruthy();
  });
});
