import { Scheduler } from 'aws-sdk';
import { ulid } from 'ulid';
import { EventSchedule, EventScheduleStore } from './types';
import { log } from '../../log';
import { withErrorCheck } from '../../aws/utils';

export type EventBridgeEventScheduleStoreProps = {
    stackName: string;
    schedulerRoleArn: string;
    scheduleGroupName: string;
    scheduleHandlerArn: string;
    scheduleExpressionTimezone?: string;
};

export const EventBridgeEventScheduleStoreProps = (): EventBridgeEventScheduleStoreProps => ({
    stackName: process.env.STACK_NAME || 'MISSING:STACK_NAME',
    schedulerRoleArn: process.env.SCHEDULER_ROLE_ARN || 'MISSING:SCHEDULER_ROLE_ARN',
    scheduleGroupName: process.env.SCHEDULE_GROUP_NAME || 'MISSING:SCHEDULE_GROUP_NAME',
    scheduleHandlerArn: process.env.SCHEDULE_HANDLER_ARN || 'MISSING:SCHEDULE_HANDLER_ARN',
});

export const EventBridgeEventScheduleStore = (props: EventBridgeEventScheduleStoreProps): EventScheduleStore => {
    const scheduler = new Scheduler();

    const add = async (schedule: EventSchedule) => {
        const msTime = new Date().getTime() + schedule.minutesLater * 60 * 1000;
        const time = new Date(msTime).toISOString().split('.')[0];
        const scheduleName = `entity-event-schedule-${ulid()}`;

        await withErrorCheck(
            scheduler.createSchedule({
                FlexibleTimeWindow: { Mode: 'OFF' },
                Name: scheduleName,
                ScheduleExpression: `at(${time})`,
                ScheduleExpressionTimezone: props.scheduleExpressionTimezone || 'UTC',
                GroupName: props.scheduleGroupName,
                Target: {
                    Arn: props.scheduleHandlerArn,
                    RoleArn: props.schedulerRoleArn,
                    Input: JSON.stringify({
                        ...schedule.event,
                        context: { ...schedule.event.context, scheduleName },
                    }),
                },
            })
        );

        log.info({ entity: schedule.event.entity, type: schedule.event.type, time }, 'Scheduled entity event');
    };

    const remove = async (scheduleName: string) => {
        await withErrorCheck(
            scheduler.deleteSchedule({
                Name: scheduleName,
                GroupName: props.scheduleGroupName,
            })
        );

        log.info({ scheduleName }, 'Schedule removed');
    };

    return { add, remove };
};
