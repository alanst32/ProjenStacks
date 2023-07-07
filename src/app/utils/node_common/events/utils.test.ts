import { PublishedEvent } from './types';
import { stringifyEvent } from './utils';

describe('stringifyEvents', () => {
  const event: PublishedEvent = {
    id: '123',
    timestamp: '2022-10-10T10:00:00.000Z',
    entity: { id: 'abc', type: 'entity' },
    payload: { content: Array(100000).fill('abc').join('') },
    type: 'entity:event',
  };

  it('removes payload that is over 250KB in size', () => {
    expect(JSON.parse(stringifyEvent(event))).toEqual({ ...event, payload: '<too big - truncated>' });
  });

  it('does not remove payload that is less than 250KB in size', () => {
    const event1: PublishedEvent = { ...event, payload: { content: 'abc' } };
    expect(JSON.parse(stringifyEvent(event1))).toEqual(event1);
  });

  it('can stringify event with undefined payload', () => {
    const event2: PublishedEvent = { ...event, payload: undefined };
    expect(JSON.parse(stringifyEvent(event2))).toEqual(event2);
  });
});
