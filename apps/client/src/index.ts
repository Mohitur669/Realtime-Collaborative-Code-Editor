import { UI_NAME } from '@codesync/ui';
import type { User } from '@codesync/shared-types';

export const clientInfo = {
  name: 'Client App Stub',
  ui: UI_NAME,
};

export const dummyUser: User = { socketId: 's1', username: 'guest' };
