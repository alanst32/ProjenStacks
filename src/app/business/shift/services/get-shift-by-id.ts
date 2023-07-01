import { ShiftStore } from '@/app/business/shift/store/types';

export type GetShiftProps = {
  shiftStore: ShiftStore;
};

export const GetShift = (props: GetShiftProps) => {
  const { shiftStore } = props;

  return async (shiftId: string) => {
    return shiftStore.getShiftById(shiftId);
  };
};
