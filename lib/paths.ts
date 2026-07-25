const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

function normalizeBasePath(basePath: string): string {
  if (!basePath) return '';
  const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return withLeadingSlash.replace(/\/+$/, '');
}

const basePath = normalizeBasePath(rawBasePath);

export function withBasePath(path: string): string {
  if (!path) return basePath || '/';
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

export function apiPath(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedPath === '/api' || normalizedPath.startsWith('/api/')) {
    return withBasePath(normalizedPath);
  }
  return withBasePath(`/api${normalizedPath}`);
}
