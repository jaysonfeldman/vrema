import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readLocalTimeEntries, saveLocalTimeEntry, deleteLocalTimeEntry } from '../src/lib/localTimeEntries.ts';

function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
const entry = {
  id: 'manual-entry', memberId: 'owner-a', title: 'Designing the homepage',
  projectId: 'personal', projectName: 'Personal', activityType: 'design',
  startTime: '2026-10-16T09:00:00Z', endTime: '2026-10-16T10:30:00Z',
  status: 'confirmed', source: 'manual', createdAt: '2026-10-16T10:30:00Z', updatedAt: '2026-10-16T10:30:00Z',
};

test('manual time survives reconstructing storage and preserves its duration', () => {
  const backing = storage();
  saveLocalTimeEntry('owner-a', entry, backing);
  // A new reader receives serialized data rather than live application state.
  const reopened = { getItem: backing.getItem, setItem: backing.setItem };
  const [restored] = readLocalTimeEntries('owner-a', reopened);
  assert.deepEqual(restored, entry);
  assert.equal((Date.parse(restored.endTime) - Date.parse(restored.startTime)) / 3600000, 1.5);
});

test('edits and deletion persist, including deleting the last entry', () => {
  const backing = storage();
  saveLocalTimeEntry('owner-a', entry, backing);
  saveLocalTimeEntry('owner-a', { ...entry, title: 'Edited time', endTime: '2026-10-16T11:00:00Z' }, backing);
  assert.equal(readLocalTimeEntries('owner-a', backing).length, 1);
  assert.equal(readLocalTimeEntries('owner-a', backing)[0].title, 'Edited time');
  deleteLocalTimeEntry('owner-a', entry.id, backing);
  assert.deepEqual(readLocalTimeEntries('owner-a', backing), []);
});

test('accounts and demo entries are stored independently', () => {
  const backing = storage();
  saveLocalTimeEntry('owner-a', entry, backing);
  saveLocalTimeEntry('demo-user', { ...entry, title: 'Demo only' }, backing);
  assert.deepEqual(readLocalTimeEntries('owner-b', backing), []);
  assert.equal(readLocalTimeEntries('owner-a', backing)[0].title, entry.title);
  assert.equal(readLocalTimeEntries('demo-user', backing)[0].title, 'Demo only');
});

test('storage write failure does not destroy an existing saved entry', () => {
  const backing = storage();
  saveLocalTimeEntry('owner-a', entry, backing);
  const full = { getItem: backing.getItem, setItem: () => { throw new Error('QuotaExceededError'); } };
  assert.throws(() => saveLocalTimeEntry('owner-a', { ...entry, title: 'Not saved' }, full), /not saved/i);
  assert.equal(readLocalTimeEntries('owner-a', backing)[0].title, entry.title);
  assert.throws(() => deleteLocalTimeEntry('owner-a', entry.id, full), /not saved/i);
  assert.equal(readLocalTimeEntries('owner-a', backing).length, 1);
});

test('unreadable saved data is retained instead of silently overwritten', () => {
  let writes = 0;
  const corrupt = { getItem: () => '{broken', setItem: () => { writes++; } };
  assert.throws(() => readLocalTimeEntries('owner-a', corrupt), /Existing data has been kept/);
  assert.throws(() => saveLocalTimeEntry('owner-a', entry, corrupt), /Existing data has been kept/);
  assert.equal(writes, 0);
});

test('rejects invalid time ranges and unavailable browser storage', () => {
  assert.throws(() => saveLocalTimeEntry('owner-a', { ...entry, endTime: entry.startTime }, storage()), /valid start and end/);
  const blocked = { getItem: () => { throw new Error('SecurityError'); }, setItem: () => {} };
  assert.throws(() => readLocalTimeEntries('owner-a', blocked), /Allow browser storage/);
});
