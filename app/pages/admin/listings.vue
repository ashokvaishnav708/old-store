<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold text-highlighted mb-6">{{ t('admin.listings_title') }}</h1>
    <AdminNav />

    <div class="flex items-center gap-2 mb-6">
      <UButton
        v-for="s in statuses"
        :key="s"
        :label="t(`statuses.${s}`)"
        :color="status === s ? 'primary' : 'neutral'"
        :variant="status === s ? 'subtle' : 'ghost'"
        size="sm"
        @click="status = s"
      />
    </div>

    <UEmpty
      v-if="!queue?.items.length"
      icon="i-lucide-package-search"
      :title="t('admin.no_listings_title')"
    />

    <div v-else class="divide-y divide-default">
      <div v-for="listing in queue.items" :key="listing.id" class="py-4">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <NuxtLink
              :to="`/listings/${listing.id}`"
              class="font-medium text-highlighted hover:text-primary"
              target="_blank"
            >
              {{ listing.title }}
            </NuxtLink>
            <p class="text-sm text-dimmed mt-1">
              {{ listing.seller.name }} ({{ listing.seller.email }}) · {{ listing.category.name }} ·
              {{ formatPrice(listing.price, listing.currency) }} ·
              {{ formatRelativeDate(listing.createdAt) }}
            </p>
            <p v-if="listing.rejectionReason" class="text-sm text-error mt-1">
              {{ t('admin.rejection_reason_label') }}: {{ listing.rejectionReason }}
            </p>
          </div>

          <div v-if="status === 'pending'" class="flex items-center gap-2 shrink-0">
            <UButton
              icon="i-lucide-check"
              color="success"
              size="sm"
              :loading="actingId === listing.id"
              @click="approve(listing.id)"
            >
              {{ t('admin.approve') }}
            </UButton>
            <UButton
              icon="i-lucide-x"
              color="error"
              variant="subtle"
              size="sm"
              @click="rejectingId = rejectingId === listing.id ? null : listing.id"
            >
              {{ t('admin.reject') }}
            </UButton>
          </div>
        </div>

        <form
          v-if="rejectingId === listing.id"
          class="flex gap-2 mt-3"
          @submit.prevent="reject(listing.id)"
        >
          <UInput
            v-model="rejectReason"
            class="flex-1"
            :placeholder="t('admin.rejection_reason_placeholder')"
          />
          <UButton type="submit" color="error" size="sm" :loading="actingId === listing.id">
            {{ t('admin.confirm_reject') }}
          </UButton>
        </form>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { AdminListingPage } from '#shared/types/models';

definePageMeta({ middleware: 'admin' });

const { t } = useI18n();
const toast = useToast();

const statuses = ['pending', 'active', 'rejected', 'sold', 'archived', 'draft'] as const;
const status = ref<(typeof statuses)[number]>('pending');

const { data: queue, refresh } = await useFetch<AdminListingPage>('/api/admin/listings', {
  query: { status }
});

const actingId = ref<string | null>(null);
const rejectingId = ref<string | null>(null);
const rejectReason = ref('');

async function approve(id: string) {
  actingId.value = id;
  try {
    await $fetch(`/api/admin/listings/${id}/approve`, { method: 'POST' });
    toast.add({ title: t('admin.listing_approved'), color: 'success' });
    await refresh();
  } catch (err) {
    toast.add({ title: t('admin.action_failed'), description: getErrorMessage(err), color: 'error' });
  } finally {
    actingId.value = null;
  }
}

async function reject(id: string) {
  if (!rejectReason.value.trim()) return;
  actingId.value = id;
  try {
    await $fetch(`/api/admin/listings/${id}/reject`, {
      method: 'POST',
      body: { reason: rejectReason.value }
    });
    toast.add({ title: t('admin.listing_rejected'), color: 'success' });
    rejectingId.value = null;
    rejectReason.value = '';
    await refresh();
  } catch (err) {
    toast.add({ title: t('admin.action_failed'), description: getErrorMessage(err), color: 'error' });
  } finally {
    actingId.value = null;
  }
}
</script>
