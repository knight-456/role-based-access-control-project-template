import React from 'react';

export interface RouterAdapter {
  navigate: (path: string) => void;
  renderLink?: (props: { href: string; className?: string; children: React.ReactNode }) => React.ReactNode;
  currentPath?: string;
}

/**
 * Creates a router adapter for Next.js App Router or Pages Router
 * Usage:
 * createNextRouterAdapter(useRouter(), Link)
 */
export function createNextRouterAdapter(
  router: { push: (url: string) => void },
  LinkComponent?: React.ComponentType<any>
): RouterAdapter {
  return {
    navigate: (path: string) => router.push(path),
    renderLink: LinkComponent
      ? ({ href, className, children }) =>
          React.createElement(LinkComponent, { href, className }, children)
      : undefined,
  };
}

/**
 * Creates a router adapter for React Router (v5/v6)
 * Usage:
 * createReactRouterAdapter(useNavigate(), Link)
 */
export function createReactRouterAdapter(
  navigateFn: (path: string) => void,
  LinkComponent?: React.ComponentType<any>
): RouterAdapter {
  return {
    navigate: (path: string) => navigateFn(path),
    renderLink: LinkComponent
      ? ({ href, className, children }) =>
          React.createElement(LinkComponent, { to: href, className }, children)
      : undefined,
  };
}
