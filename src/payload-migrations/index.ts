import * as migration_20251018_152647 from './20251018_152647';
import * as migration_20251019_120001 from './20251019_120001';

export const migrations = [
  {
    up: migration_20251018_152647.up,
    down: migration_20251018_152647.down,
    name: '20251018_152647',
  },
  {
    up: migration_20251019_120001.up,
    down: migration_20251019_120001.down,
    name: '20251019_120001',
  },
];
