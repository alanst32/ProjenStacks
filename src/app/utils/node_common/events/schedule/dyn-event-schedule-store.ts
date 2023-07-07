import { DynamoDB as Dyn } from 'aws-sdk';
import { nanoid } from 'nanoid';
import { EventSchedule, EventScheduleStore } from './types';
import { getTimeToLive } from '../../aws/dynamo/utils';
import { log } from '../../log';
import { withErrorCheck } from '../../aws/utils/utils';

const toRecord = (schedule: EventSchedule) => ({
    pk: `schedule#${nanoid()}`,
    sk: 'event',
    event: schedule.event,
    ttl: getTimeToLive(schedule.minutesLater),
});

export const DynEventScheduleStore = (table: string): EventScheduleStore => {
    const db = new Dyn.DocumentClient();

    const add = async (schedule: EventSchedule) => {
        await withErrorCheck(db.put({ TableName: table, Item: toRecord(schedule) }));
        log.trace({ schedule }, 'Event schedule record added');
    };

    const remove = async () => {
        throw new Error('Remove method not available in DynEventScheduleStore');
    };

    return { add, remove };
};
