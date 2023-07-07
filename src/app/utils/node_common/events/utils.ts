import { DynamoDB as Dyn } from 'aws-sdk';
import { Context, Entity, Event, PublishedEvent } from './types';
import { log } from '../log';

/**
 * @hidden
 * @internal
 */
export const toPk = (entity: Entity) => `${entity.type}#${entity.id}`;

export const toPublishedEvent = (rec: Dyn.DocumentClient.AttributeMap): PublishedEvent => ({
    id: rec.id,
    type: rec.type,
    entity: { id: rec.entity_id, type: rec.entity_type },
    timestamp: rec.timestamp,
    payload: rec.payload,
    context: rec.context,
});

/**
 * @hidden
 * @internal
 */
export const stringifyEvent = (event: PublishedEvent) => {
    const buffer = event.payload === undefined ? undefined : Buffer.from(JSON.stringify(event.payload), 'utf-8');
    const bufferLength = buffer?.length ?? 0;
    log.trace({ bufferLength }, 'Stringified published event');

    // Make sure size do not exceed 250KB
    const trimmed = bufferLength > 250 * 1024 ? { ...event, payload: '<too big - truncated>' } : event;

    return JSON.stringify(trimmed);
};

/**
 * Returns an asEvent function for specific event type.
 */
export const AsEvent =
    <E extends Event>(type: E['type'], asEntity: (id: string) => Entity) =>
    (id: string, payload: E['payload'], context?: Context): E =>
        ({ entity: asEntity(id), type, payload, context } as E);
