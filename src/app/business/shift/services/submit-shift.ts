import { ShiftRequest } from '../model/model';
import { ShiftStore } from '../store/types';

export type SubmitShiftProps = {
  shiftStore: ShiftStore;
};

export const SubmitShift = (props: SubmitShiftProps) => {
  const { shiftStore } = props;

  const processSubmission = async (request: ShiftRequest) => {
    const shiftId = await shiftStore.saveShift(request);
    return { shiftId, message: 'Shift submitted' };
  };

  return { processSubmission };
};
