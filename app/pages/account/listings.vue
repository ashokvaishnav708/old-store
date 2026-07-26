<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-highlighted">{{ t('account.my_listings_title') }}</h1>
      <UButton to="/listings/new" icon="i-lucide-plus">{{ t('home.post_ad') }}</UButton>
    </div>

    <UEmpty
      v-if="!listings?.length"
      icon="i-lucide-package-search"
      :title="t('account.no_listings_title')"
      :description="t('account.no_listings_description')"
      :actions="[{ label: t('home.post_ad'), to: '/listings/new' }]"
    />

    <div v-else class="divide-y divide-default">
      <div
        v-for="listing in listings"
        :key="listing.id"
        class="flex items-center justify-between py-4 gap-4"
      >
        <div>
          <NuxtLink
            :to="`/listings/${listing.id}`"
            class="font-medium text-highlighted hover:text-primary"
          >
            {{ listing.title }}
          </NuxtLink>
          <div class="flex items-center gap-2 text-sm text-dimmed mt-1">
            <UBadge :color="statusColors[listing.status]" variant="subtle">
              {{ t(`statuses.${listing.status}`) }}
            </UBadge>
            <span>{{ listing.category.name }}</span>
            <span>·</span>
            <span>{{ t('listing.views', { count: listing.viewCount }) }}</span>
            <span>·</span>
            <span>{{ formatPrice(listing.price, listing.currency) }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <UButton
            :to="`/listings/${listing.id}/edit`"
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            @click="deleteListing(listing.id)"
          />
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { MyListing } from '#shared/types/models';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const toast = useToast();
const { data: listings, refresh } = await useFetch<MyListing[]>('/api/listings/mine');

const statusColors: Record<string, 'success' | 'neutral' | 'warning'> = {
  active: 'success',
  sold: 'neutral',
  archived: 'warning',
  draft: 'neutral'
};

async function deleteListing(id: string) {
  const url: string = `/api/listings/${id}`;
  await $fetch(url, { method: 'DELETE' });
  toast.add({ title: t('listing.delete_success'), color: 'success' });
  refresh();
}
</script>
