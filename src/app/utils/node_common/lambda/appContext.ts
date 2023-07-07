export type AppContext = {
    processEnv: any;
    environment: string;
    table: string;
    ttlDays?: number;
};

/**
 * Init common variables for the lambdas
 *
 * @returns
 */
export const initAppContext = (): AppContext => {
    const env = process.env;
    const environment = env.DEPLOY_ENV || 'MISSING_DEPLOY_ENV';

    return {
        processEnv: env,
        environment,
        table: env.TABLE_NAME || 'MISSING:TABLE_NAME',
        ttlDays: env.DYNAMO_TTL_DAYS === undefined ? undefined : parseInt(env.DYNAMO_TTL_DAYS!),
    };
};
