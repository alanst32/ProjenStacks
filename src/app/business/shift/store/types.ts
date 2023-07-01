import { Shift, ShiftRequest } from '../model/model.';

export interface ShiftStore {
  getShiftById: (id: string) => Promise<Shift | undefined>;
  saveShift: (request: ShiftRequest) => Promise<void>;
}
