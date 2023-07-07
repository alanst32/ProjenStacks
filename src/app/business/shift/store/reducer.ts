import { flatten } from 'lodash';
import { Shift } from '../model/model';

export type Reducer = (shfit: Shift, record: any) => Shift;

/**
 * Shift Reducer, that allows the load of the same PK and setting of each SK to a different interface object
 * @param props
 * @returns
 */
export const DefaultReducer = (): Reducer => {
  return (shift: Shift, record: any) => {
    if (!shift.id) shift.id = record.transaction_id;

    shift.createdAt = record.timestamp || record.createdAt;

    if (record?.statusEvents) {
      shift.statusEvents =
        (Array.isArray(shift.statusEvents)
          ? flatten([shift.statusEvents, record?.statusEvents])
          : record?.statusEvents) || [];
    }

    shift.data = record.body;

    return shift;
  };
};

export const Reduce = (props: { reducer: Reducer }) => {
  const { reducer } = props;

  return <Shift>(records: any[]): Shift | undefined => {
    if (!records.length) return undefined;

    const sorted = records.sort((a, b) => {
      const timeA = a.timestamp || a.created;
      const timeB = b.timestamp || b.created;
      return timeA?.localeCompare?.(timeB) || 0;
    });
    return sorted.reduce((transaction, record) => reducer(transaction, record), {});
  };
};
