import { z } from 'zod';

export const ShiftRequest = z.object({
  id: z.string(),
  businessName: z.string(),
  shiftDate: z.string(),
  shiftStartTime: z.string(),
  shiftEndTime: z.string(),
  hourValue: z.number().min(0),
});
export type ShiftRequest = z.infer<typeof ShiftRequest>;

export const ShiftKey = z.object({
  shiftId: z.string(),
});
export type ShiftKey = z.infer<typeof ShiftKey>;

export type StatusEvents = {
  status: string;
  createdAt: string;
};

export interface Shift {
  id: string;
  createdAt: string;
  statusEvents?: StatusEvents;
  data: ShiftRequest;
}
