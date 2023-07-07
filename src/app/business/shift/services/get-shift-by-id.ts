import { ShiftKey } from '../model/model';
import { ShiftStore } from '../store/types';

export type GetShiftProps = {
  shiftStore: ShiftStore;
};

export const GetShift = (props: GetShiftProps) => {
  const { shiftStore } = props;

  const processGet = async (request: ShiftKey) => {
    return shiftStore.getShiftById(request.shiftId);
  };

  return { processGet };
};
