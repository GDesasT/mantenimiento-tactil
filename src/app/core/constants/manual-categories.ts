export const MANUAL_CATEGORIES: string[] = [
  'Juki',
  'Brother',
  'Supreme',
  'Eagle',
  'Dolphin',
  'General',
  'Focus',
  'Durkopp',
  'Mitubishi',
  'Sistemas Mantenimiento',
];

const MANUAL_CATEGORY_COLORS: Record<string, string> = {
  juki: '#2563eb',
  brother: '#dc2626',
  supreme: '#f59e0b',
  eagle: '#10b981',
  dolphin: '#0ea5e9',
  general: '#8b5cf6',
    focus: '#ec4899',
  'sistemas mantenimiento': '#10b981',
  'mitubishi': '#ef4444',
    durkopp: '#3b82f6',
    
};

export function normalizeManualCategory(category: string | null | undefined): string {
  return category?.trim() ?? '';
}

export function resolveManualCategory(category: string | null | undefined): string {
  const normalized = normalizeManualCategory(category);
  if (!normalized) return '';

  const hardcoded = MANUAL_CATEGORIES.find(
    (item) => item.toLowerCase() === normalized.toLowerCase()
  );

  return hardcoded ?? normalized;
}

export function getManualCategoryColor(category: string | null | undefined): string {
  const normalized = normalizeManualCategory(category).toLowerCase();
  if (!normalized) return '#6b7280';

  if (MANUAL_CATEGORY_COLORS[normalized]) {
    return MANUAL_CATEGORY_COLORS[normalized];
  }

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
}
