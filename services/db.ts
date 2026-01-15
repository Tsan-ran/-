
import { Taxon, MothEntry, StorageKey, ImportRecord, BiodiversityRecord } from '../types';

interface AppSettings {
  driveRootId: string;
}

const generateEntryCode = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const ymd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const hms = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${ymd}-${hms}`;
};

export const db = {
  getTaxonIndex: (): Taxon[] => {
    try {
      const data = localStorage.getItem(StorageKey.TAXON_INDEX);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  saveTaxonIndex: (index: Taxon[]) => {
    localStorage.setItem(StorageKey.TAXON_INDEX, JSON.stringify(index));
  },

  getEntries: (): MothEntry[] => {
    try {
      const data = localStorage.getItem(StorageKey.ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  getEntryByTaxonId: (taxonId: string): MothEntry | undefined => {
    return db.getEntries().find(e => e.id === taxonId);
  },

  saveEntry: (entry: MothEntry) => {
    const entries = db.getEntries();
    const index = entries.findIndex(e => e.id === entry.id);
    
    const updatedEntry = JSON.parse(JSON.stringify(entry));
    updatedEntry.lastUpdated = Date.now();
    
    if (!updatedEntry.entry_code) {
      updatedEntry.entry_code = generateEntryCode();
    }

    if (index !== -1) {
      entries[index] = updatedEntry;
    } else {
      entries.unshift(updatedEntry);
    }
    
    localStorage.setItem(StorageKey.ENTRIES, JSON.stringify(entries));
  },

  deleteEntry: (taxonId: string) => {
    const entries = db.getEntries();
    const filtered = entries.filter(e => e.id !== taxonId);
    localStorage.setItem(StorageKey.ENTRIES, JSON.stringify(filtered));
  },

  getImportHistory: (): ImportRecord[] => {
    try {
      const data = localStorage.getItem(StorageKey.IMPORT_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  addImportRecord: (record: ImportRecord) => {
    const history = db.getImportHistory();
    history.unshift(record);
    localStorage.setItem(StorageKey.IMPORT_HISTORY, JSON.stringify(history.slice(0, 10)));
  },

  getSettings: (): AppSettings => {
    try {
      const data = localStorage.getItem(StorageKey.SETTINGS);
      return data ? JSON.parse(data) : { driveRootId: '' };
    } catch { return { driveRootId: '' }; }
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(StorageKey.SETTINGS, JSON.stringify(settings));
  },

  // Added methods for BiodiversityRecord support used in AddRecord page
  getRecords: (): BiodiversityRecord[] => {
    try {
      const data = localStorage.getItem(StorageKey.RECORDS);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  saveRecord: (record: BiodiversityRecord) => {
    const records = db.getRecords();
    records.unshift(record);
    localStorage.setItem(StorageKey.RECORDS, JSON.stringify(records));
  },

  updateRecord: (record: BiodiversityRecord) => {
    const records = db.getRecords();
    const index = records.findIndex(r => r.id === record.id);
    if (index !== -1) {
      records[index] = record;
      localStorage.setItem(StorageKey.RECORDS, JSON.stringify(records));
    }
  },

  deleteRecord: (id: string) => {
    const records = db.getRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(StorageKey.RECORDS, JSON.stringify(filtered));
  },

  clearAll: () => {
    localStorage.removeItem(StorageKey.TAXON_INDEX);
    localStorage.removeItem(StorageKey.ENTRIES);
    localStorage.removeItem(StorageKey.IMPORT_HISTORY);
    localStorage.removeItem(StorageKey.SETTINGS);
    localStorage.removeItem(StorageKey.RECORDS);
  }
};
