export const mockLog = {
    silent: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    when: jest.fn(() => ({ then: () => ({ else: jest.fn() }) })),
};

jest.mock('./log', () => ({
    ...jest.requireActual('./log'),
    log: mockLog,
}));
