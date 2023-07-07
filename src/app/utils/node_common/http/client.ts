import { IncomingHttpHeaders } from 'http';
import * as https from 'https';
import { Serializable } from '../lang';
import { toLowerCasedKey } from '../lang/record';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const JSON_MIME = 'application/json';

export type HttpResponse<T> = {
    headers: IncomingHttpHeaders;
    statusCode: number;
    body: T;
    request: { options: https.RequestOptions; body: Serializable };
    error?: Error;
};

export type RequestOptions = {
    headers: Record<string, string>;
    /** Request time out in miliseconds. */
    timeout: number;
};

const getContentBuffer = (data: any, contentType: string): Buffer | undefined => {
    if (data === undefined) return undefined;
    else if (contentType === JSON_MIME) return Buffer.from(JSON.stringify(data));
    else if (Buffer.isBuffer(data)) return data;
    else return Buffer.from(data.toString());
};

const invoke = async <T = any>(
    url: string,
    method: HttpMethod,
    data: Serializable,
    props?: Partial<RequestOptions>
): Promise<HttpResponse<T>> => {
    const defaultProps: Partial<RequestOptions> = { timeout: 10000 };
    const currentProps: Partial<RequestOptions> = { ...defaultProps, ...props };
    const loweredHeaders = toLowerCasedKey(currentProps.headers || {});
    const contentType = loweredHeaders['content-type'] || JSON_MIME;
    const content = getContentBuffer(data, contentType);

    const httpOptions = {
        method,
        timeout: currentProps.timeout, // in milis
        headers: {
            ...currentProps.headers,
            Connection: 'keep-alive',
            'User-Agent': 'HTTP Client (@rosterfy/node-common)',
            'Content-Type': contentType,
            'Content-Length': content?.length ?? 0,
        },
    };

    return new Promise<HttpResponse<T>>((resolve, reject) => {
        const req = https.request(url, httpOptions, res => {
            const chunks: any[] = [];
            const isErrorStatus = (statusCode: number) => statusCode < 200 || statusCode >= 400;
            const getResponseBody = () => {
                const body = Buffer.concat(chunks);
                const headerContentType = toLowerCasedKey(res.headers)['content-type'];
                const isJsonContent =
                    typeof headerContentType === 'string'
                        ? headerContentType.startsWith(JSON_MIME)
                        : headerContentType?.includes(JSON_MIME);

                return isJsonContent ? JSON.parse(body.toString()) : body;
            };

            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                if (!res.statusCode) throw new Error('Status code not available');

                const error = isErrorStatus(res.statusCode)
                    ? new Error(`HTTP ${res.statusCode} ${res.statusMessage}`)
                    : undefined;

                resolve({
                    headers: res.headers,
                    statusCode: res.statusCode,
                    body: getResponseBody(),
                    request: { options: httpOptions, body: content },
                    error,
                });
            });
        });

        req.on('error', err => reject(err));

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timed out'));
        });

        if (content) req.write(content);

        req.end();
    });
};

const invokeMethod = (method: HttpMethod) => {
    return <T = any>(url: string, data?: Serializable, options?: Partial<RequestOptions>) =>
        invoke<T>(url, method, data, { ...options });
};

const methods = {
    /**
     * Send a GET request to the URL.
     * @param url The request destination - must be HTTPS url.
     * @param data The data to include in the request.
     * @returns The {@link HttpResponse} object.
     */
    get: invokeMethod('GET'),

    /**
     * Send a POST request to the URL.
     * @param url The request destination - must be HTTPS url.
     * @param data The data to include in the request.
     * @returns The {@link HttpResponse} object.
     */
    post: invokeMethod('POST'),

    /**
     * Send a PUT request to the URL.
     * @param url The request destination - must be HTTPS url.
     * @param data The data to include in the request.
     * @returns The {@link HttpResponse} object.
     */
    put: invokeMethod('PUT'),

    /**
     * Send a DELETE request to the URL.
     * @param url The request destination - must be HTTPS url.
     * @param data The data to include in the request.
     * @returns The {@link HttpResponse} object.
     */
    delete: invokeMethod('DELETE'),
};

/**
 * A light-weight HTTP client with no dependencies using built-in node https function.
 * Note that HttpClient works for HTTPS connection only.
 */
export const HttpClient = () => {
    return methods;
};
