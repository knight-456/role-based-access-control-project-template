# Universal Enterprise RBAC & Masters Template

A production-ready, highly modular, frontend-only RBAC (Role-Based Access Control) and Masters framework built for React and Next.js. Engineered to connect directly to any backend REST API with **zero hardcoded keys**, **dynamic permission naming & aliases**, **pluggable API adapters**, **granular action toggles**, **dynamic table schemas**, and **built-in solutions for all enterprise integration roadblocks**.

---

## 🌟 Core Highlights

- **Frontend-Only**: No database or backend code required. Directly interfaces with backend API endpoints.
- **Universal Framework Routing**: Native adapters for Next.js App Router (`useRouter`), React Router (`useNavigate`, `Link`), TanStack Router, and Remix—eliminating full-page browser reloads.
- **Zero FOUC (Flash of Unauthorized Content)**: Full SSR session hydration support (`initialUser`, `initialPermissions`) prevents permission flashing on server-rendered pages.
- **Silent Token Refresh & Request Replay**: Transparently catches 401s, calls your refresh token API, and replays failed requests without logging the user out.
- **Multi-Tenancy & Workspace Switching**: Built-in `activeTenantId` and `setTenantId()` automatically injects `X-Tenant-Id` headers and re-fetches permissions on the fly.
- **Flexible Pagination Engine**: Seamlessly adapts to 0-based (`page=0`), 1-based (`page=1`), or SQL offset/limit (`offset=0&limit=10`) backend contracts.
- **Cascading Form Dropdowns**: Dynamic select options that filter automatically based on parent fields (e.g. Department list dynamically filtered by selected Entity).
- **Zero Hardcoded Permission Strings**: All permission names are isolated in module-level constants (`src/constants/permissions/`).
- **Supports Any Permission Naming Convention**: Whether your backend sends `roles.add`, `roles.addition`, `roles:create`, or `ROLE_ADD`, it matches automatically via the dynamic permission resolver and alias map.
- **100% Complete Style & ClassName Overrides**: Strip default styles with `unstyled={true}` or inject custom Tailwind/CSS classes into any sub-element.
- **Dual ESM & CommonJS**: Ships with first-class ES modules (`dist/esm`) and CommonJS (`dist/cjs`) bundles with full TypeScript `.d.ts` declarations.

---

## 🛠️ Solutions for Enterprise Integration Roadblocks

### 1. Framework Routing (Next.js & React Router)
Avoid full-page reloads by passing your framework's native router:

```tsx
// Next.js App Router:
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createNextRouterAdapter, createRBACConfig } from '@custom/rbac-template';

const rbacConfig = createRBACConfig({
  apiBaseUrl: 'https://api.example.com',
  router: createNextRouterAdapter(useRouter(), Link),
});

// React Router (Vite / CRA):
import { useNavigate, Link } from 'react-router-dom';
import { createReactRouterAdapter } from '@custom/rbac-template';

const rbacConfig = createRBACConfig({
  router: createReactRouterAdapter(useNavigate(), Link),
});
```

---

### 2. Eliminating SSR Flashing (Zero FOUC)
In Next.js, read your session on the server and pass it directly to `PermissionProvider`. The page renders with full permissions immediately upon hydration:

```tsx
// app/layout.tsx (Server Component)
import { getServerSession } from '@/lib/auth';
import { ClientProviders } from './providers';

export default async function RootLayout({ children }) {
  const session = await getServerSession();

  return (
    <html>
      <body>
        <ClientProviders
          initialUser={session?.user}
          initialPermissions={session?.permissions}
          initialNavigation={session?.navigation}
        >
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
```

---

### 3. Silent Token Refresh (401 Interception)
Prevent users from losing form progress due to expired access tokens:

```typescript
const rbacConfig = createRBACConfig({
  apiBaseUrl: 'https://api.example.com',
  getToken: () => localStorage.getItem('accessToken'),
  // Catches 401s, refreshes token, and replays failed requests transparently:
  refreshToken: async () => {
    const res = await fetch('/api/auth/refresh', { method: 'POST' });
    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  },
  onUnauthorized: () => {
    window.location.href = '/login';
  },
});
```

---

### 4. Multi-Tenancy & Entity Switching
Switch active company/branch workspaces and automatically update permissions:

```tsx
import { usePermission } from '@custom/rbac-template';

export function TenantSwitcher({ entities }) {
  const { activeTenantId, setTenantId } = usePermission();

  return (
    <select
      value={activeTenantId || ''}
      onChange={(e) => setTenantId(e.target.value)} // Automatically refetches /auth/me & adds X-Tenant-Id header
    >
      {entities.map((e) => (
        <option key={e.id} value={e.id}>
          {e.name}
        </option>
      ))}
    </select>
  );
}
```

---

### 5. Backend Pagination Contract Adaptation
Configure 0-based vs 1-based indexing or offset/limit mode in 1 line:

```typescript
const rbacConfig = createRBACConfig({
  pagination: {
    pageIndexOffset: 0,      // For Spring Boot (0-based indexing: page=0)
    pageParamName: 'pageIndex',
    limitParamName: 'pageSize',
    // Or for SQL offset/limit:
    // useOffsetLimit: true,
    // offsetParamName: 'offset',
  },
});
```

---

### 6. Cascading / Dependent Form Dropdowns
Configure form fields to dynamically filter based on parent selections:

```tsx
<EmployeeMasterView
  formFields={[
    { name: 'firstName', label: 'First Name', required: true },
    {
      name: 'entityId',
      label: 'Entity',
      type: 'select',
      options: entities.map((e) => ({ label: e.name, value: e.id })),
    },
    {
      name: 'departmentId',
      label: 'Department',
      type: 'select',
      dependsOn: ['entityId'], // Re-evaluates when entityId changes
      options: (formData) =>
        departments
          .filter((d) => !formData.entityId || d.entityId === formData.entityId)
          .map((d) => ({ label: d.name, value: d.id })),
      disabled: (formData) => !formData.entityId, // Disabled until entity is chosen
    },
  ]}
/>
```

---

### 7. Dynamic Permission Names & Aliases (`roles.add` vs `roles.addition`)

```typescript
const rbacConfig = createRBACConfig({
  permissionAliases: {
    'roles.add': 'roles.addition',          // Maps 'roles.add' -> 'roles.addition'
    'roles.edit': 'roles:modify',           // Colon notation support
    'department_master.add': 'dept.create', // Custom department create slug
  },
  // Or global format resolver:
  // permissionResolver: (module, action) => `${module}:${action}`,
});
```

---

### 8. Field-Level Validation Error Mapping
When your backend validation fails (e.g. HTTP 400 or 422 with `{ errors: { name: "Name is already taken" } }` or `{ errors: [{ field: "code", message: "Duplicate" }] }`), `HttpClient` and `MasterDataTable` automatically normalize and highlight each field directly under its input element.

---

### 9. Toast & Notification Library Callbacks
Connect any UI toast library (Sonner, react-toastify, AntD, Chakra) with zero vendor lock-in:

```typescript
import { toast } from 'sonner';

const rbacConfig = createRBACConfig({
  onNotification: ({ type, title, message }) => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast(message);
  },
});
```

---

### 10. URL Query State Synchronization (Deep Linking)
Keep table filters, search keywords, page index, and sort order in sync with browser query params so users can bookmark and share URLs:

```tsx
<DepartmentMasterView syncWithUrl={true} defaultSortBy="name" defaultSortOrder="asc" />
```

---

### 11. Column Sorting (Ascending / Descending)
Mark any column as sortable with custom backend keys and direction toggle indicators:

```tsx
<Table
  columns={[
    { key: 'name', header: 'Department Name', sortable: true, sortKey: 'dept_name' },
    { key: 'createdAt', header: 'Created At', sortable: true },
  ]}
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSortChange={(colKey, direction) => handleSort(colKey, direction)}
/>
```

---

### 12. Bulk Row Selection & Batch Actions
Opt-in multi-row select checkboxes with floating batch action toolbars:

```tsx
<DepartmentMasterView
  selectable={true}
  batchActions={[
    {
      key: 'export',
      label: 'Export Selected',
      onClick: (selectedIds, selectedItems) => exportToCsv(selectedItems),
    },
    {
      key: 'archive',
      label: 'Archive',
      variant: 'danger',
      onClick: (selectedIds) => archiveDepartments(selectedIds),
    },
  ]}
/>
```

---

### 13. Multi-Language i18n Localization
Translate or customize all table buttons, modals, badges, and counters:

```typescript
const rbacConfig = createRBACConfig({
  i18n: {
    addNew: '+ Añadir',
    saveChanges: 'Guardar cambios',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    searchPlaceholder: 'Buscar...',
    showingEntries: (from, to, total) => `Mostrando ${from} a ${to} de ${total} registros`,
  },
});
```

---

### 14. File & Multipart Uploads (`FormData`)
`HttpClient` automatically detects `FormData` instances, omitting default JSON headers so the browser dynamically injects the appropriate `multipart/form-data; boundary=...`:

```typescript
const formData = new FormData();
formData.append('file', file);
await http.upload('/masters/departments/import', formData);
```

---

## 🎨 Complete Style & ClassName Overrides

Pass custom CSS / Tailwind classes directly to any element of the module:
```tsx
<DepartmentMasterView
  classNames={{
    root: 'p-6 bg-slate-900 text-white rounded-2xl',
    header: {
      title: 'text-2xl font-bold text-amber-400',
      addButton: 'bg-amber-500 hover:bg-amber-600 text-black',
    },
    table: {
      thead: 'bg-slate-800 text-slate-300 font-semibold',
      th: 'px-6 py-4 uppercase tracking-wider text-xs',
      tr: 'hover:bg-slate-800/50 border-b border-slate-800',
      td: 'px-6 py-4 text-slate-300',
    },
  }}
/>
```

Or pass `unstyled={true}` to strip all default styling when using **shadcn/ui**, **MUI**, or **Bootstrap**.

---

## 📄 License
MIT
