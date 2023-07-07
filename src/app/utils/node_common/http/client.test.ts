import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { HttpClient } from './client';
import { sleep } from '../promise/utils';

describe('HttpPost', () => {
    const url = 'https://abc.com';
    const notFoundUrl = 'https://abc.com/not-found-url';
    const http = HttpClient();

    const server = setupServer(
        rest.get(url, (_req, res, ctx) => {
            return res(ctx.status(200), ctx.json({ name: 'Rosterfy' }));
        }),
        rest.post(url, async (_req, res, ctx) => {
            await sleep(50);
            return res(ctx.status(200), ctx.json({ name: 'Rosterfy' }));
        }),
        rest.post(notFoundUrl, (_req, res, ctx) => {
            return res(ctx.status(404), ctx.json({ message: 'Not found' }));
        })
    );

    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('gets data from URL', async () => {
        const res = await http.get(url, undefined, { headers: { 'x-test': 'test' } });
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Rosterfy');
        expect(res.error).toBeUndefined();
        expect(res.headers).toEqual(
            expect.objectContaining({
                'content-type': expect.stringContaining('application/json'),
            })
        );
        expect(res.request.body).toBeUndefined();
        expect(res.request.options.headers?.['Content-Type']).toEqual('application/json');
        expect(res.request.options.headers?.['Content-Length']).toBe(0);
        expect(res.request.options.headers?.['x-test']).toBe('test');
    });

    it('sets error for invalid status code', async () => {
        const params = new URLSearchParams();
        params.append('key1', 'key1-value');
        params.append('key2', 'key2-value');

        const res = await http.post(notFoundUrl, params, { headers: { 'Content-Type': 'application/pdf' } });
        expect(res.request.options.headers?.['Content-Type']).toEqual('application/pdf');
        expect(res.request.body).toEqual(Buffer.from(params.toString()));
        expect(res.error?.message).toBe('HTTP 404 Not Found');
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ message: 'Not found' });
    });

    it('throws when request times out', async () => {
        await expect(http.post(url, undefined, { timeout: 1 })).rejects.toThrow('timed out');
    });
});
