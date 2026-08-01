<template>
  <UContainer class="py-8">
    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
      <aside class="space-y-4">
        <UInput v-model="filters.q" icon="i-lucide-search" :placeholder="t('search.keyword')" />
        <USelect
          v-model="filters.categoryId"
          :items="categoryOptions"
          :placeholder="t('search.category')"
          class="w-full"
        />
        <USelect
          v-model="filters.condition"
          :items="conditionOptions"
          :placeholder="t('search.condition')"
          class="w-full"
        />
        <div class="flex gap-2">
          <UInputNumber
            v-model="filters.minPrice"
            :placeholder="t('search.min_price')"
            class="w-full"
          />
          <UInputNumber
            v-model="filters.maxPrice"
            :placeholder="t('search.max_price')"
            class="w-full"
          />
        </div>
        <UInput
          v-model="filters.location"
          icon="i-lucide-map-pin"
          :placeholder="t('search.location')"
        />
      </aside>

      <section class="space-y-6">
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted">
            {{ t('search.results', { count: listingsPage?.total ?? 0 }) }}
          </p>
          <USelect v-model="filters.sort" :items="sortOptions" class="w-48" />
        </div>

        <div v-if="status === 'pending'" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <USkeleton v-for="i in 6" :key="i" class="h-56 w-full" />
        </div>

        <ListingGrid
          v-else-if="listingsPage?.items.length"
          :listings="listingsPage.items"
          grid-class="grid grid-cols-2 sm:grid-cols-3 gap-4"
        />

        <UEmpty
          v-else
          icon="i-lucide-search-x"
          :title="t('search.no_results_title')"
          :description="t('search.no_results_description')"
        />

        <div v-if="listingsPage && listingsPage.totalPages > 1" class="flex justify-center">
          <UPagination
            v-model:page="filters.page"
            :total="listingsPage.total"
            :items-per-page="listingsPage.pageSize"
          />
        </div>
      </section>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { ListingPage } from '#shared/types/models';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { data: categories } = useCategories();

const filters = reactive({
  q: (route.query.q as string) || '',
  categoryId: (route.query.categoryId as string) || undefined,
  condition: (route.query.condition as string) || undefined,
  minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
  maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
  location: (route.query.location as string) || '',
  sort: (route.query.sort as string) || 'newest',
  page: Number(route.query.page) || 1
});

const conditionOptions = computed(() => [
  { label: t('search.any_condition'), value: undefined },
  { label: t('conditions.new'), value: 'new' },
  { label: t('conditions.like_new'), value: 'like_new' },
  { label: t('conditions.used'), value: 'used' },
  { label: t('conditions.for_parts'), value: 'for_parts' }
]);

const sortOptions = computed(() => [
  { label: t('search.sort_newest'), value: 'newest' },
  { label: t('search.sort_price_asc'), value: 'price_asc' },
  { label: t('search.sort_price_desc'), value: 'price_desc' }
]);

const categoryOptions = computed(() => [
  { label: t('search.any_category'), value: undefined },
  ...(categories.value || []).map(c => ({ label: c.name, value: c.id }))
]);

const query = computed(() => {
  const q: Record<string, string | number> = { page: filters.page, sort: filters.sort };
  if (filters.q) q.q = filters.q;
  if (filters.categoryId) q.categoryId = filters.categoryId;
  if (filters.condition) q.condition = filters.condition;
  if (filters.minPrice) q.minPrice = filters.minPrice;
  if (filters.maxPrice) q.maxPrice = filters.maxPrice;
  if (filters.location) q.location = filters.location;
  return q;
});

const { data: listingsPage, status } = await useFetch<ListingPage>('/api/listings', {
  query,
  watch: [query]
});

watch(
  query,
  value => {
    router.replace({ query: value });
  },
  { deep: true }
);

watch(
  () => [
    filters.q,
    filters.categoryId,
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
    filters.location,
    filters.sort
  ],
  () => {
    filters.page = 1;
  }
);
</script>
