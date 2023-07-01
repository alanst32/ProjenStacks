/* eslint-disable import/order */
import { SnsDispatcher } from './sns-dispatcher';
import { PublishedEvent } from '../types';
import { mockSnsPublish } from '../../mocks/sns.mock';

describe('SnsDispatcher', () => {
  it('dispatches event to SNS', async () => {
    const published: PublishedEvent = {
      id: 'event-id',
      type: 'transaction:test-event',
      payload: { abc: '123' },
      entity: { id: '1', type: 'transaction' },
      timestamp: '2022-09-19T00:01:01.000',
    };

    await SnsDispatcher({ topicArn: 'my-topic' }).dispatch(published);

    expect(mockSnsPublish).toHaveBeenCalledWith({
      TopicArn: 'my-topic',
      Message:
        '{"id":"event-id","type":"transaction:test-event","payload":{"abc":"123"},"entity":{"id":"1","type":"transaction"},"timestamp":"2022-09-19T00:01:01.000"}',
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: 'transaction:test-event',
        },
      },
    });
  });
});
