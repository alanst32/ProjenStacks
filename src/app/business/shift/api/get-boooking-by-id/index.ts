import { Handler } from './handler';
import { ApiHandler } from 'src/app/utils/node-common/apigateway';
import { initAppContext } from 'src/app/utils/node-common/lambda/appContext';

export const handler = ApiHandler(Handler(initAppContext()));
