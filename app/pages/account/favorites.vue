<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold text-highlighted mb-6">{{ t('account.favorites_title') }}</h1>

    <UEmpty
      v-if="!favorites?.length"
      icon="i-lucide-heart"
      :title="t('account.no_favorites_title')"
      :description="t('account.no_favorites_description')"
      :actions="[{ label: t('account.browse_listings'), to: '/search' }]"
    />

    <div v-else class="divide-y divide-default">
      <div
        v-for="favorite in favorites"
        :key="favorite.listingId"
        class="flex items-center justify-between py-4 gap-4"
      >
        <div>
          <NuxtLink
            :to="`/listings/${favorite.listingId}`"
            class="font-medium text-highlighted hover:text-primary"
          >
            {{ favorite.title }}
          </NuxtLink>
          <div class="flex items-center gap-2 text-sm text-dimmed mt-1">
            <span>{{ favorite.category.name }}</span>
            <span>·</span>
            <span>{{ formatPrice(favorite.price, favorite.currency) }}</span>
          </div>
        </div>
        <UButton
          icon="i-lucide-heart-off"
          color="neutral"
          variant="ghost"
          @click="removeFavorite(favorite.listingId)"
        />
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { FavoriteListing } from '#shared/types/models';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const { data: favorites, refresh } = await useFetch<FavoriteListing[]>('/api/favorites');

async function removeFavorite(listingId: string) {
  await $fetch(`/api/favorites/${listingId}`, { method: 'DELETE' });
  refresh();
}
</script>
