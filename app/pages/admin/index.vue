<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold text-highlighted mb-6">{{ t('admin.dashboard_title') }}</h1>
    <AdminNav />

    <div class="grid sm:grid-cols-2 gap-4">
      <UCard :to="'/admin/listings'" class="hover:ring-primary transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-dimmed">{{ t('admin.pending_listings') }}</p>
            <p class="text-3xl font-bold text-highlighted">{{ pendingCount }}</p>
          </div>
          <UIcon name="i-lucide-package-search" class="size-8 text-primary" />
        </div>
      </UCard>

      <UCard :to="'/admin/complaints'" class="hover:ring-primary transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-dimmed">{{ t('admin.open_complaints') }}</p>
            <p class="text-3xl font-bold text-highlighted">{{ openComplaintsCount }}</p>
          </div>
          <UIcon name="i-lucide-flag" class="size-8 text-primary" />
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { AdminListingPage, AdminComplaint } from '#shared/types/models';

definePageMeta({ middleware: 'admin' });

const { t } = useI18n();

const { data: pendingListings } = await useFetch<AdminListingPage>('/api/admin/listings', {
  query: { status: 'pending', pageSize: 1 }
});
const { data: openComplaints } = await useFetch<AdminComplaint[]>('/api/admin/complaints', {
  query: { status: 'open' }
});

const pendingCount = computed(() => pendingListings.value?.total ?? 0);
const openComplaintsCount = computed(() => openComplaints.value?.length ?? 0);
</script>
