import { Shift, ShiftRequest } from '@/app/business/shift/model/shift';

export interface ShiftStore {
  getShiftById: (id: string) => Promise<Shift | undefined>;
  saveShift: (request: ShiftRequest) => Promise<void>;
}
