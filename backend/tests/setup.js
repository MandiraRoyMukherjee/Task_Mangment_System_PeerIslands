process.env.NODE_ENV = 'test';

global.console = {
  ...console,
};

jest.setTimeout(10000);

afterEach(() => {
  jest.clearAllMocks();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});