import { EventBridgeDispatcher } from './dispatcher/eb-dispatcher';
import { SnsDispatcher } from './dispatcher/sns-dispatcher';
import { DynEventStore } from './dyn-event-store';
import { DynFailureStore } from './failure-store';
import { AddListener } from './listener';
import { DynEventReceiptStore } from './receipt-store';
import { EventBridgeEventScheduleStore, EventBridgeEventScheduleStoreProps } from './schedule/eb-event-schedule-store';
import { ScheduleRetry } from './schedule-retry';

/**
 * Default event store which uses DynamoDB as store.
 */
export const defaultEventStore = (() => {
  const table = process.env.TABLE_NAME || 'MISSING:TABLE_NAME';
  const stackName = process.env.STACK_NAME || 'MISSING:STACK_NAME';
  const entityEventIndexName = process.env.ENTITY_EVENT_INDEX_NAME || 'MISSING:ENTITY_EVENT_INDEX_NAME';
  const topicArn = process.env.ENTITY_EVENT_TOPIC_ARN;
  const dispatcher = topicArn ? SnsDispatcher({ topicArn }) : EventBridgeDispatcher(stackName);
  return DynEventStore({ table, dispatcher, entityEventIndexName });
})();

/**
 * Default event bus which uses EventBridge as transport.
 */
export const defaultEventBus = (() => {
  const table = process.env.TABLE_NAME || 'MISSING:TABLE_NAME';
  const retryQueueUrl = process.env.RETRY_QUEUE_URL || 'MISSING:RETRY_QUEUE_URL';
  const retryAttempt = Number(process.env.RETRY_ATTEMPT || 2);
  const receiptStore = DynEventReceiptStore(table, 120);
  const failureStore = DynFailureStore(table);
  const scheduleRetry = ScheduleRetry({ receiptStore, failureStore, retryQueueUrl, retryAttempt });

  return {
    addListener: AddListener({ receiptStore, scheduleRetry }),
  };
})();

/**
 * Default schedule store which uses EventBridge Scheduler to schedule events.
 */
export const defaultScheduleStore = (() => {
  return EventBridgeEventScheduleStore(EventBridgeEventScheduleStoreProps());
})();

/**
 * The Event namespace that provides store, publisher, and listener functions.
 * When the environment variable `ENTITY_EVENT_TOPIC_ARN` is supplied,
 * the dispatcher will use SnsDispatcher and publish event to the SNS topic.
 */
export namespace Event {
  export const store = defaultEventStore;
  export const publish = store.publish;
  export const record = store.record;
  export const remove = store.remove;
  export const addListener = defaultEventBus.addListener;
}
