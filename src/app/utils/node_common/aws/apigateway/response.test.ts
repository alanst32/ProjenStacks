import { ForbiddenError } from './errors';
import { Response } from './response';

describe('aws/apigateway/response', () => {
    it('creates response with correct HTTP status', () => {
        expect(Response.accepted()).toEqual({
            body: '{"message":"Accepted"}',
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            statusCode: 202,
        });

        expect(Response.ok('fine')).toEqual({
            body: '{"message":"fine"}',
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            statusCode: 200,
        });

        expect(Response.seeOther({ location: '123' })).toEqual({
            body: '{"location":"123"}',
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            statusCode: 303,
        });

        expect(Response.seeOther({ location: 'https://a.be' })).toEqual({
            body: '{"location":"https://a.be"}',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                Location: 'https://a.be',
            },
            statusCode: 303,
        });

        expect(Response.apiError(new ForbiddenError())).toEqual({
            body: '{"message":"Forbidden"}',
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            statusCode: 403,
        });
    });
});
