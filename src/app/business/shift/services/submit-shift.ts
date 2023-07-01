import { ShiftRequest } from '@app/business/shift/model/model.';
import { ShiftStore } from '@app/business/shift/store/types';

export type SubmitShiftProps = {
  shiftStore: ShiftStore;
};

export const SubmitShift = (props: SubmitShiftProps) => {
  const { shiftStore } = props;

  return async (request: ShiftRequest) => {
    const shiftId = await shiftStore.saveShift(request);
    return { shiftId, message: 'Shift submitted' };
  };
};
