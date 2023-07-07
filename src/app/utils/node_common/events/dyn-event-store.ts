import { DynamoDB as Dyn } from 'aws-sdk';
import { ulid } from 'ulid';
import { Entity, Event, PublishedEvent, Dispatcher, EventStore, PublishOptions, QueryOptions } from './types';
import { toPk, toPublishedEvent } from './utils';
import { BatchDeleteAll, QueryAll } from '../aws/dynamo/batch';
import { withErrorCheck } from '../aws/utils';

const toRecord = (event: PublishedEvent) => ({
  pk: toPk(event.entity),
  sk: `event#${event.id}`,
  id: event.id,
  type: event.type,
  entity_id: event.entity.id,
  entity_type: event.entity.type,
  timestamp: event.timestamp,
  payload: event.payload,
  context: event.context,
});

export type DynEventStoreProps = {
  readonly table: string;
  readonly entityEventIndexName?: string;
  readonly dispatcher: Dispatcher;
};

/**
 * The event store that uses DynamoDB as storage.
 * @param props {@link DynEventStoreProps}
 * @returns The EventStore implementation.
 */
export const DynEventStore = (props: DynEventStoreProps): EventStore => {
  const { table, dispatcher } = props;
  const db = new Dyn.DocumentClient();
  const batchDelete = BatchDeleteAll(props.table, db);
  const queryAll = QueryAll(db);

  const getRecords = (entity: Entity, options?: QueryOptions) => {
    const { eventType } = options ?? {};
    if (eventType && !props.entityEventIndexName) {
      throw new Error('Querying by event type requires entityEventIndexName property supplied');
    }

    const condition = '#pk = :pk' + (eventType ? ' AND #type = :type' : '');
    const attrValues = { ':pk': toPk(entity), ...(eventType ? { ':type': eventType } : {}) };
    const attrNames = { '#pk': 'pk', ...(eventType ? { '#type': 'type' } : {}) };

    return queryAll({
      TableName: props.table,
      IndexName: eventType ? props.entityEventIndexName : undefined,
      ScanIndexForward: options?.ascending,
      Limit: options?.limit,
      KeyConditionExpression: condition,
      ExpressionAttributeValues: attrValues,
      ExpressionAttributeNames: attrNames,
    });
  };

  const publish = async (event: Event, options?: PublishOptions) => {
    const published: PublishedEvent = {
      ...event,
      id: ulid(),
      timestamp: new Date().toISOString(),
    };
    await withErrorCheck(db.put({ TableName: table, Item: toRecord(published) }), 'Failed storing published event');
    if (!options?.silent) await dispatcher.dispatch(published);
  };

  return {
    publish,
    record: event => publish(event, { silent: true }),
    load: async (entity, options) => {
      const records = await getRecords(entity, options);
      return records.map(toPublishedEvent);
    },
    remove: async entity => {
      const records = await getRecords(entity);
      await batchDelete(records.map(r => ({ pk: r.pk, sk: r.sk })));
    },
  };
};
