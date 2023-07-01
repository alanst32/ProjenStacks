import { APIGatewayProxyEvent } from 'aws-lambda';
import { ShiftKey } from '../../model/model.';
import { GetShift } from '../../services/get-shift-by-id';
import { DynamoShiftStore } from '../../store/store';
import { Response } from 'src/app/utils/node-common/apigateway';
import { AppContext } from 'src/app/utils/node-common/lambda/appContext';
import { extractError } from 'src/app/utils/node-common/zod/utils';

export const Handler = (appCtx: AppContext) => {
  const shiftStore = DynamoShiftStore(appCtx);
  const getShift = GetShift({ shiftStore });

  return async (event: APIGatewayProxyEvent) => {
    if (!event.body) return Response.bad('Missing request body');

    const requestParsed = ShiftKey.safeParse(event.body);
    if (!requestParsed.success) {
      return Response.bad({ message: 'Invalid payload', errors: extractError(requestParsed.error) });
    }

    const { shiftId } = event.pathParameters ?? {};
    const request = ShiftKey.parse({ shiftId });

    let result = await getShift.processGet(request);
    return Response.ok({ ...result, message: 'success' });
  };
};
