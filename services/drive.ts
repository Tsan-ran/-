
import { MothEntry, MothStage, formatScientificName } from '../types';

/**
 * Google Drive 整合服務
 * 負責維護資料夾樹結構：Family > Genus > Species > Stage
 */

// 內部資料夾 ID 快取，避免重複請求
const folderCache: Record<string, string> = {};

/**
 * 清理檔名或資料夾名中的非法字元
 */
const sanitizeName = (name: string): string => {
  return name.trim().replace(/[\\/?%*:|"<>]/g, '_') || '__UNNAMED__';
};

/**
 * 模擬 Google Drive API 呼叫 (實際專案中此處應使用 fetch 或 gapi)
 * 模擬在指定父資料夾下尋找或建立子資料夾
 */
async function findOrCreateFolder(parentID: string, name: string): Promise<string> {
  const cacheKey = `${parentID}:${name}`;
  if (folderCache[cacheKey]) return folderCache[cacheKey];

  console.log(`[Drive] Ensuring folder: "${name}" inside parent: ${parentID}`);
  
  // 模擬網路延遲
  await new Promise(r => setTimeout(r, 100));
  
  // 模擬回傳一個隨機產生的 Drive Folder ID
  const newID = `folder_${Math.random().toString(36).substr(2, 9)}`;
  folderCache[cacheKey] = newID;
  return newID;
}

/**
 * 根據物種資訊，確保完整的資料夾樹存在
 * 返回最終的 Stage 資料夾 ID
 */
export async function ensureFolderPath(
  rootID: string, 
  entry: MothEntry, 
  stage: MothStage
): Promise<{ folderId: string; displayPath: string }> {
  if (!rootID) throw new Error("Google Drive ROOT ID is not configured.");

  // 1. 科 (Family)
  const familyName = sanitizeName(entry.family || '__UNSORTED__');
  const familyID = await findOrCreateFolder(rootID, familyName);

  // 2. 屬 (Genus)
  const genusName = entry.genus ? sanitizeName(entry.genus) : '__UNSORTED__';
  const genusID = await findOrCreateFolder(familyID, genusName);

  // 3. 種 (Species)
  // 若沒有種名，資料夾名為 "__UNSORTED__"
  const speciesLabel = entry.species 
    ? sanitizeName(formatScientificName(entry.genus, entry.species, entry.subspecies))
    : '__UNSORTED__';
  const speciesID = await findOrCreateFolder(genusID, speciesLabel);

  // 4. 階段 (Stage)
  const stageID = await findOrCreateFolder(speciesID, stage);

  return {
    folderId: stageID,
    displayPath: `${familyName}/${genusName}/${speciesLabel}/${stage}`
  };
}

/**
 * 模擬上傳檔案到指定資料夾
 */
export async function uploadFileToDrive(file: File, folderId: string): Promise<string> {
  console.log(`[Drive] Uploading "${file.name}" to folder: ${folderId}`);
  await new Promise(r => setTimeout(r, 500));
  return `https://drive.google.com/file/d/simulated_${Math.random().toString(36).substr(2, 9)}/view`;
}
