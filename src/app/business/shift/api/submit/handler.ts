import { APIGatewayProxyEvent } from 'aws-lambda';
import { ShiftRequest } from '../../model/model.';
import { SubmitShift } from '../../services/submit-shift';
import { DynamoShiftStore } from '../../store/store';
import { Response } from 'src/app/utils/node-common/apigateway';
import { AppContext } from 'src/app/utils/node-common/lambda/appContext';
import { extractError } from 'src/app/utils/node-common/zod/utils';

export const Handler = (appCtx: AppContext) => {
  const shiftStore = DynamoShiftStore(appCtx);
  const submitShift = SubmitShift({ shiftStore });

  return async (event: APIGatewayProxyEvent) => {
    if (!event.body) return Response.bad('Missing request body');

    const requestParsed = ShiftRequest.safeParse(event.body);
    if (!requestParsed.success) {
      return Response.bad({ message: 'Invalid payload', errors: extractError(requestParsed.error) });
    }

    const shiftRequest = requestParsed.data;
    let result = await submitShift.processSubmission(shiftRequest);
    return Response.ok({ ...result, message: 'success' });
  };
};
