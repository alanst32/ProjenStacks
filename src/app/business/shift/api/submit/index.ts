import { Handler } from './handler';
import { ApiHandler } from 'src/app/utils/node_common/aws/apigateway';
import { initAppContext } from 'src/app/utils/node_common/lambda/appContext';

export const handler = ApiHandler(Handler(initAppContext()));
