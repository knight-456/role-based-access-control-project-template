export interface RBACLocaleStrings {
  // Actions
  addNew: string;
  create: string;
  edit: string;
  delete: string;
  saveChanges: string;
  cancel: string;
  confirm: string;
  confirmDelete: string;
  confirmDeleteMessage: string;
  deleteTitle: string;
  permissions: string;
  toggleAll: string;
  actions: string;
  search: string;
  searchPlaceholder: string;
  noData: string;
  loading: string;
  checkingPermissions: string;
  accessDenied: string;
  accessDeniedMessage: string;

  // Feedback & Notifications
  success: string;
  error: string;

  // Pagination
  showingEntries: (from: number, to: number, total: number) => string;
  pageOf: (page: number, totalPages: number) => string;
  previous: string;
  next: string;

  // Batch actions
  selectedCount: (count: number) => string;
  itemsSelected: (count: number) => string;
  selectAll: string;
  clearSelection: string;

  // Status
  active: string;
  inactive: string;
}

export const DEFAULT_LOCALE_STRINGS: RBACLocaleStrings = {
  addNew: '+ Add New',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  saveChanges: 'Save Changes',
  cancel: 'Cancel',
  confirm: 'Confirm',
  confirmDelete: 'Confirm Delete',
  confirmDeleteMessage: 'Are you sure you want to delete this record? This action cannot be undone.',
  deleteTitle: 'Delete Record',
  permissions: 'Permissions',
  toggleAll: 'Toggle All',
  actions: 'Actions',
  search: 'Search',
  searchPlaceholder: 'Search...',
  noData: 'No data available',
  loading: 'Loading...',
  checkingPermissions: 'Checking permissions...',
  accessDenied: 'Access Denied',
  accessDeniedMessage: 'You do not have permission to access this resource.',

  success: 'Success',
  error: 'Error',

  showingEntries: (from, to, total) => `Showing ${from} to ${to} of ${total} entries`,
  pageOf: (page, totalPages) => `Page ${page} of ${totalPages}`,
  previous: 'Previous',
  next: 'Next',

  selectedCount: (count) => `${count} selected`,
  itemsSelected: (count) => `${count} items selected`,
  selectAll: 'Select All',
  clearSelection: 'Clear',

  active: 'Active',
  inactive: 'Inactive',
};
