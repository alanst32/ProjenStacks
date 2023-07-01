import { Serializable } from '../lang/types';

export type EntityType = string;
export type EventName = string;
export type Timestamp = string;
export type Payload = Serializable;
export type Entity = { id: string; type: string };
export type EventType = `${EntityType}:${EventName}`;
export type Context = { [name: string]: Serializable };

/** Represents an event of an entity. */
export type Event<T extends EventType = EventType, P extends Payload = Payload> = {
  readonly entity: Entity;
  readonly type: T;
  readonly payload: P;
  readonly context?: Context;
};

/** Represents a published event of the system. */
export type PublishedEvent<E extends Event = Event> = E & {
  readonly id: string;
  readonly timestamp: Timestamp;
};

/** The event listener interface. */
export type EventListener<E extends PublishedEvent = PublishedEvent> = (event: E) => Promise<void>;

/** The event publishing options. */
export type PublishOptions = {
  /** Whether the event should be propagated via the event dispatcher. Default value is false. In most cases, event publishing should not be silent. In some cases, however, it may be required to store the event without propagating it unnecessarily, i.e. no listeners are expected to process the event. */
  silent?: boolean;
};

export type QueryOptions = {
  limit?: number;
  eventType?: EventType;
  ascending?: boolean;
};

/**
 * The EventStore interface
 * @interface
 */
export type EventStore = {
  /**
   * Publishes and record the event in the store.
   * @param event The {@link Event} to publish.
   */
  publish: (event: Event, options?: PublishOptions) => Promise<void>;

  /**
   * Record the event without propagation.
   * Same as the `publish` method with the `silent` flag set to true.
   * @param event The {@link Event} to record.
   */
  record: (event: Event) => Promise<void>;

  /**
   * Load all published events for the entity from the store.
   * @param entity The {@link Entity} object.
   * @returns void
   */
  load: (entity: Entity, options?: QueryOptions) => Promise<PublishedEvent[]>;

  /**
   * Remove or delete all stored events for the entity from the store.
   * @param entity The {@link Entity} object.
   * @returns void
   */
  remove: (entity: Entity) => Promise<void>;
};

/**
 * The event dispatcher interface.
 * The dispatcher may use any one-to-many messaging system to dispatch the event.
 * @interface
 */
export type Dispatcher = {
  dispatch: (published: PublishedEvent) => Promise<void>;
};

/**
 * @hidden
 * @internal
 */
export type FunctionEventKey = { id: string; functionName: string };

/**
 * The event trigger source used to identify whether an event is triggered
 * from a schedule or by the client.
 * @enum
 */
export enum EventTrigger {
  Client = 'client',
  Expiry = 'expiry',
  Schedule = 'schedule',
}
