import type { CategorySummary } from '#shared/types/models';

export function useCategories() {
  return useFetch<CategorySummary[]>('/api/categories', {
    key: 'categories',
    default: () => []
  });
}
