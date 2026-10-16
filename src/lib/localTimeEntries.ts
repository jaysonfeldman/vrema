import type { TimeEntry } from './types';

const storageKey = (ownerId: string) => `vrema-time-entries:${encodeURIComponent(ownerId)}`;
type EntryStorage = Pick<Storage, 'getItem' | 'setItem'>;

function isTimeEntry(value: unknown): value is TimeEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<TimeEntry>;
  return typeof entry.id === 'string' && typeof entry.memberId === 'string'
    && typeof entry.title === 'string' && typeof entry.projectName === 'string'
    && typeof entry.activityType === 'string'
    && Number.isFinite(Date.parse(entry.startTime ?? ''))
    && Number.isFinite(Date.parse(entry.endTime ?? ''))
    && Date.parse(entry.endTime!) > Date.parse(entry.startTime!);
}

export function readLocalTimeEntries(ownerId: string, storage: EntryStorage = localStorage): TimeEntry[] {
  let raw: string | null;
  try {
    raw = storage.getItem(storageKey(ownerId));
  } catch {
    throw new Error('Your saved time could not be opened. Allow browser storage and try again.');
  }
  if (raw === null) return [];
  try {
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.entries) || !data.entries.every(isTimeEntry)) {
      throw new Error('Invalid saved entries');
    }
    return data.entries;
  } catch {
    // Do not overwrite unreadable data with an empty calendar.
    throw new Error('Your saved time could not be read. Existing data has been kept.');
  }
}

function writeEntries(ownerId: string, entries: TimeEntry[], storage: EntryStorage) {
  try {
    storage.setItem(storageKey(ownerId), JSON.stringify({ version: 1, entries }));
  } catch {
    throw new Error('Time was not saved. Browser storage is full or unavailable; free some space or allow storage and try again.');
  }
  return entries;
}

export function saveLocalTimeEntry(ownerId: string, entry: TimeEntry, storage: EntryStorage = localStorage): TimeEntry[] {
  if (!isTimeEntry(entry)) throw new Error('Choose a valid start and end time before saving.');
  const entries = readLocalTimeEntries(ownerId, storage);
  const existing = entries.findIndex((item) => item.id === entry.id);
  if (existing < 0) entries.push(entry);
  else entries[existing] = entry;
  // Persist before publishing the change to the UI. A failed write must not look saved.
  return writeEntries(ownerId, entries, storage);
}

export function deleteLocalTimeEntry(ownerId: string, id: string, storage: EntryStorage = localStorage): TimeEntry[] {
  const entries = readLocalTimeEntries(ownerId, storage).filter((entry) => entry.id !== id);
  return writeEntries(ownerId, entries, storage);
}
