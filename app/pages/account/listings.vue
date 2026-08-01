<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-1">
      <h1 class="text-2xl font-bold text-highlighted">{{ t('account.my_listings_title') }}</h1>
      <UButton
        to="/listings/new"
        icon="i-lucide-plus"
        :disabled="atLimit"
      >
        {{ t('home.post_ad') }}
      </UButton>
    </div>
    <p class="text-sm mb-6" :class="atLimit ? 'text-warning' : 'text-dimmed'">
      {{ t('account.listing_quota', { used: activeCount, limit: currentLimit }) }}
      <span v-if="atLimit"> — {{ t('account.listing_quota_reached') }}</span>
      <ULink to="/account/profile" class="text-primary ms-1">{{ t('account.upgrade_link') }}</ULink>
    </p>

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
            <template v-if="listing.status === 'active' && listing.expiresAt">
              <span>·</span>
              <span>{{ t('listing.expires_on', { date: new Date(listing.expiresAt).toLocaleDateString() }) }}</span>
            </template>
          </div>
          <p v-if="listing.status === 'rejected' && listing.rejectionReason" class="text-sm text-error mt-1">
            {{ t('admin.rejection_reason_label') }}: {{ listing.rejectionReason }}
          </p>
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
import { effectiveListingLimit } from '#shared/utils/subscriptions';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const toast = useToast();
const { user } = useUserSession();
const { data: listings, refresh } = await useFetch<MyListing[]>('/api/listings/mine');

const activeCount = computed(
  () => listings.value?.filter(l => l.status === 'pending' || l.status === 'active').length ?? 0
);
const currentLimit = computed(() => (user.value ? effectiveListingLimit(user.value) : 5));
const atLimit = computed(() => activeCount.value >= currentLimit.value);

const statusColors: Record<string, 'success' | 'neutral' | 'warning' | 'error'> = {
  active: 'success',
  pending: 'warning',
  rejected: 'error',
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
