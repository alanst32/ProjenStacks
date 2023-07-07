/**
 * Converts a date to the DynamoDB time-to-live value.
 * @param date The TTL date.
 * @returns TTL value for DynamoDB.
 */
export const ttlFromDate = (date = new Date()) => {
    return Math.floor(date.getTime() / 1000);
};

/**
 * Converts minutes to the DynamoDB time-to-live value.
 * @param minutesLater Number of minutes.
 * @returns TTL value for DynamoDB.
 */
export const getTimeToLive = (minutesLater = 30) => {
    const now = ttlFromDate();
    return now + Math.abs(isNaN(minutesLater) ? 30 : minutesLater) * 60;
};
