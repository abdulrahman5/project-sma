import * as migration_20261022_210630_initial from './20261022_210630_initial';
import * as migration_20261022_223443_social_posts from './20261022_223443_social_posts';

export const migrations = [
  {
    up: migration_20261022_210630_initial.up,
    down: migration_20261022_210630_initial.down,
    name: '20261022_210630_initial',
  },
  {
    up: migration_20261022_223443_social_posts.up,
    down: migration_20261022_223443_social_posts.down,
    name: '20261022_223443_social_posts'
  },
];
