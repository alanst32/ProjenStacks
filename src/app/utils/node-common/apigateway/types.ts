// eslint-disable-next-line import/no-extraneous-dependencies
import { APIGatewayProxyEvent } from "aws-lambda";

/** Extended {@link @aws-lambda/APIGatewayProxyEvent} with additional `rawBody` and `rawHeaders` properties. */
export type ApiEvent = APIGatewayProxyEvent & {
  body: any;
  rawBody: string;
  rawHeaders: Record<string, string>;
};
