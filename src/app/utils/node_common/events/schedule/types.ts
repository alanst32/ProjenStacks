import { Event } from '../types';

export type EventSchedule = { event: Event; minutesLater: number };

export type EventScheduleStore = {
    add: (schedule: EventSchedule) => Promise<void>;
    remove: (scheduleId: string) => Promise<void>;
};
