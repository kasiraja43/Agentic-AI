import { readFileSync } from 'fs';

export class PromptLoader {
  load(filePath: string): string {
    return readFileSync(filePath, 'utf8');
  }
}
