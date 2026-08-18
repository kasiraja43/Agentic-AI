import { mkdirSync, existsSync } from 'fs';

export class FileUtils {
  static ensureDir(dirPath: string): void {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }
}
