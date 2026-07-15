import { afterAll, beforeAll } from 'vitest';

import * as jotform from './src/index.js';
import { API_URL, server } from './test/mockServer.js';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

jotform.options({
  apiKey: 'test-api-key',
  url: API_URL,
});
