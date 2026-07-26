<script setup lang="ts">
import type { ListingPage } from '#shared/types/models';

const { t } = useI18n();
const { data: categories } = useCategories();
const { data: listingsPage } = await useFetch<ListingPage>('/api/listings', {
  key: 'home-listings',
  query: { sort: 'newest', pageSize: 12 }
});
</script>

<template>
  <div>
    <UPageHero
      :title="t('home.heroTitle')"
      :description="t('home.heroDescription')"
      :links="[
        { label: t('home.postAd'), to: '/listings/new', icon: 'i-lucide-plus', size: 'lg' },
        {
          label: t('home.browseListings'),
          to: '/search',
          size: 'lg',
          color: 'neutral',
          variant: 'subtle'
        }
      ]"
    />

    <UPageSection :title="t('home.categories')" :ui="{ container: 'gap-6' }">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <UPageCard
          v-for="category in categories"
          :key="category.id"
          :to="{ path: '/search', query: { categoryId: category.id } }"
          :title="category.name"
          :icon="category.icon || 'i-lucide-tag'"
          orientation="vertical"
          spotlight
          class="text-center"
        />
      </div>
    </UPageSection>

    <UPageSection :title="t('home.recentlyListed')" :ui="{ container: 'gap-6' }">
      <div
        v-if="listingsPage?.items.length"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <ListingCard v-for="listing in listingsPage.items" :key="listing.id" :listing="listing" />
      </div>
      <UEmpty
        v-else
        icon="i-lucide-package-search"
        :title="t('home.noListingsTitle')"
        :description="t('home.noListingsDescription')"
      />
    </UPageSection>
  </div>
</template>
