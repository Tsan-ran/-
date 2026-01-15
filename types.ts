
export interface Taxon {
  taxon_id: string;
  scientific_name: string; // simple_name from TaiCOL
  chinese_name: string;
  rank: string;
  family: string;
  genus: string;
  species?: string;
  subspecies?: string;
  // Properties added for compatibility with AddRecord and selection state
  path?: string;
  subfamily?: string;
  species_epithet?: string;
}

export type Gender = 'male' | 'female' | 'uncertain';
export type MothStage = 'egg' | 'larva' | 'pupa' | 'adult';

export interface PhotoItem {
  id: string;
  url: string; 
  name: string;
  size: number;
  width?: number;
  height?: number;
  type: string;
  gender?: Gender;
  // 新增 Drive 追蹤欄位
  drive_folder_id?: string;
  drive_path_display?: string;
}

// Added for PhotoUploader and AddRecord support
export interface Photo extends PhotoItem {
  inat_link?: string;
  drive_link?: string;
}

export interface PhotoSet {
  id: string;
  inat_link: string;
  photos: PhotoItem[];
}

export interface MothEntry {
  id: string; // taxon_id
  entry_code: string; // YYYYMMDD-HHMMSS
  taxon_name: string; // genus + species
  taxon_chinese: string;
  taxon_rank: string;
  family: string;
  genus: string;
  species?: string;
  subspecies?: string;
  notes: string;
  stages: Record<MothStage, PhotoSet[]>;
  lastUpdated: number;
}

// Added for compatibility with AddRecord
export interface BiodiversityRecord {
  id: string;
  taxon_id: string;
  taxon_name: string;
  taxon_chinese: string;
  taxon_rank: string;
  taxon_path?: string;
  inat_link?: string;
  stage: MothStage | 'unknown';
  notes?: string;
  photos: Photo[];
  createdAt: number;
}

export interface ImportRecord {
  id: string;
  filename: string;
  timestamp: number;
  count: number;
  type: 'taxonomy_csv';
}

export enum StorageKey {
  TAXON_INDEX = 'moth_taxon_index_v3',
  ENTRIES = 'moth_entries_v3',
  IMPORT_HISTORY = 'moth_import_history_v2',
  SETTINGS = 'moth_settings_v1',
  RECORDS = 'moth_records_v1'
}

/**
 * 格式化學名顯示規則：
 * 1. 若只有屬名：Genus sp.
 * 2. 若有種名：Genus species
 * 3. 若有亞種：Genus species subspecies
 */
export const formatScientificName = (genus: string, species?: string, subspecies?: string): string => {
  if (!species) return `${genus} sp.`;
  if (subspecies) return `${genus} ${species} ${subspecies}`;
  return `${genus} ${species}`;
};
