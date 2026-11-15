/**
 * Action keys, IDs, and human-readable labels.
 * Used for the Permission Matrix and Permission Gates.
 */
export const DEFAULT_ACTION_KEYS = {
  VIEW: 'view',
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  ASSIGN: 'assign',
} as const;

export const DEFAULT_ACTION_CONFIGS = [
  { actionId: 1, action_key: DEFAULT_ACTION_KEYS.VIEW, action_name: 'View', sort_order: 1 },
  { actionId: 2, action_key: DEFAULT_ACTION_KEYS.ADD, action_name: 'Add (Create)', sort_order: 2 },
  { actionId: 3, action_key: DEFAULT_ACTION_KEYS.EDIT, action_name: 'Edit', sort_order: 3 },
  { actionId: 4, action_key: DEFAULT_ACTION_KEYS.DELETE, action_name: 'Delete', sort_order: 4 },
  { actionId: 5, action_key: DEFAULT_ACTION_KEYS.ASSIGN, action_name: 'Assign', sort_order: 5 },
] as const;

export type ActionKey = (typeof DEFAULT_ACTION_KEYS)[keyof typeof DEFAULT_ACTION_KEYS] | string;
