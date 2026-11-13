import * as FileSystem from 'expo-file-system/legacy';
import type { MobileStorage } from './notes-app';

const NOTES_FILE_NAME = 'threadnote-notes.json';
const BACKUP_FILE_NAME = 'threadnote-backup.json';

function getNotesFileUri(): string {
  if (FileSystem.documentDirectory === null) {
    throw new Error('Expo document directory is unavailable');
  }

  return `${FileSystem.documentDirectory}${NOTES_FILE_NAME}`;
}

function getBackupFileUri(): string {
  if (FileSystem.documentDirectory === null) {
    throw new Error('Expo document directory is unavailable');
  }

  return `${FileSystem.documentDirectory}${BACKUP_FILE_NAME}`;
}

export function createExpoMobileStorage(): MobileStorage {
  return {
    async read() {
      try {
        return await FileSystem.readAsStringAsync(getNotesFileUri());
      } catch {
        return null;
      }
    },
    write(content) {
      return FileSystem.writeAsStringAsync(getNotesFileUri(), content);
    },
    async readBackup() {
      try {
        return await FileSystem.readAsStringAsync(getBackupFileUri());
      } catch {
        return null;
      }
    },
    writeBackup(content) {
      return FileSystem.writeAsStringAsync(getBackupFileUri(), content);
    },
  };
}
