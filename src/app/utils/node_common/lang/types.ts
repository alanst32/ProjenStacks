/** Primivite JavaScript value. */
export type Primitive = string | number | boolean | Date | undefined;

/** JSON Serializable object. */
export type Serializable = Primitive | { [x: string]: Serializable } | Serializable[] | object;

/** JSON Serializable record. */
export type SerializableRecord = Record<string, Serializable>;

/** Provides the deep partial type of the supplied type. */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
