import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchCalendarEvents } from '../src/services/googleCalendarService.ts';

const range = {
  timeMin: new Date('2026-01-01T00:00:00Z'),
  timeMax: new Date('2026-12-31T00:00:00Z'),
};
const event = (id) => ({
  id, summary: 'Acme#design Review',
  start: { dateTime: '2026-10-16T09:00:00Z' },
  end: { dateTime: '2026-10-16T10:00:00Z' },
});

test('fetches all pages with the same date range and authentication', async (t) => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url: new URL(url), options });
    return Response.json(requests.length === 1
      ? { items: [event('first'), { id: 'all-day', start: { date: '2026-10-16' } }], nextPageToken: 'page+two/token' }
      : { items: [event('second')] });
  });
  const result = await fetchCalendarEvents('test-access-token', range);
  assert.deepEqual(result.map(e => e.id), ['first', 'second']);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].url.searchParams.has('pageToken'), false);
  assert.equal(requests[1].url.searchParams.get('pageToken'), 'page+two/token');
  for (const request of requests) {
    assert.equal(request.url.searchParams.get('timeMin'), range.timeMin.toISOString());
    assert.equal(request.url.searchParams.get('timeMax'), range.timeMax.toISOString());
    assert.equal(request.options.headers.Authorization, 'Bearer test-access-token');
  }
});

for (const [status, message] of [[401, /session expired/i], [403, /access was denied/i], [500, /sync failed \(500\)/i]]) {
  test(`surfaces actionable failure for HTTP ${status}`, async (t) => {
    t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status }));
    await assert.rejects(fetchCalendarEvents('test-access-token', range), message);
  });
}

test('rejects a failed later page instead of returning a partial sync', async (t) => {
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async () => ++requests === 1
    ? Response.json({ items: [event('first')], nextPageToken: 'next' })
    : new Response('{}', { status: 500 }));
  await assert.rejects(fetchCalendarEvents('test-access-token', range), /sync failed/i);
  assert.equal(requests, 2);
});

test('accepts an empty calendar and rejects a malformed event list', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => Response.json({}));
  assert.deepEqual(await fetchCalendarEvents('test-access-token', range), []);
  mock.mock.mockImplementation(async () => Response.json({ items: 'invalid' }));
  await assert.rejects(fetchCalendarEvents('test-access-token', range), /invalid event list/i);
});
