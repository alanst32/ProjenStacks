/** The function to call before the handler runs. This function must return the event after modification. */
export type Before<TEvent> = (event: TEvent) => TEvent | Promise<TEvent>;

/** The function to run after the handler runs. */
export type After<TResponse> = (response: TResponse) => TResponse | Promise<TResponse>;

/** The function to run when an error is thrown from the handler. */
export type OnError<TResponse, TError> = (error: TError) => TResponse | Promise<TResponse>;

/** The handler to wrap. */
export type Handler<TEvent, TResponse> = (event: TEvent) => TResponse | Promise<TResponse>;

/**
 * The interface for a middleware implementation.
 * To implement a middleware, supply the optional before, after and onError methods.
 * @interface
 */
export type Middleware<TEvent = any, TResponse = void, TError extends Error = Error> = {
    before?: Before<TEvent>;
    after?: After<TResponse>;
    onError?: OnError<TResponse, TError>;
};

/**
 * Attach a handler with middlewares.
 * @param handler The event handler.
 * @returns Wrap a handler in middleware.
 * @example
 * ```ts
 * const handler = (event: ApiEvent) => console.log(event);
 * const wrapped = WithMiddleware(handler).use(middleware1).use(middleware2);
 * ```
 */
export const WithMiddleware = <TEvent = any, TResponse = void, TError extends Error = Error>(
    handler: Handler<TEvent, TResponse>
) => {
    const applyBefore = (existingHandler: Handler<TEvent, TResponse>, before: Before<TEvent>) => {
        return async (event: TEvent) => {
            const beforeEvent = await before(event);
            return existingHandler(beforeEvent);
        };
    };

    const applyAfter = (existingHandler: Handler<TEvent, TResponse>, after: After<TResponse>) => {
        return async (event: TEvent) => {
            const result = await existingHandler(event);
            return after(result);
        };
    };

    const applyOnError = (existingHandler: Handler<TEvent, TResponse>, onError: OnError<TResponse, TError>) => {
        return async (event: TEvent) => {
            try {
                return await existingHandler(event);
            } catch (error: any) {
                return onError(error);
            }
        };
    };

    /** @internal */
    type TMiddleware = Middleware<TEvent, TResponse, TError>;

    /** @internal */
    type TAppliedHandler = Handler<TEvent, TResponse> & {
        use: (...middlewares: TMiddleware[]) => TAppliedHandler;
    };

    const allMiddlewares: TMiddleware[] = [];

    const apply = (baseHandler: Handler<TEvent, TResponse>, middlewares: TMiddleware[]) => {
        let applied: Handler<TEvent, TResponse> = baseHandler;

        for (let i = 0; i < middlewares.length; i++) {
            // Reverse order so first added 'before' will run first
            const before = middlewares[middlewares.length - 1 - i].before;
            applied = before ? applyBefore(applied, before) : applied;

            const after = middlewares[i].after;
            applied = after ? applyAfter(applied, after) : applied;

            const onError = middlewares[i].onError;
            applied = onError ? applyOnError(applied, onError) : applied;
        }

        return applied;
    };

    const use = (...middlewares: TMiddleware[]): TAppliedHandler => {
        allMiddlewares.push(...middlewares);
        const applied = apply(handler, allMiddlewares);
        // Add 'use' function so that we can chain the call.
        return Object.setPrototypeOf(applied, { ...applied.prototype, use });
    };

    return use(...allMiddlewares);
};
