<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold text-highlighted mb-6">{{ t('admin.complaints_title') }}</h1>
    <AdminNav />

    <div class="flex items-center gap-2 mb-6">
      <UButton
        v-for="s in statuses"
        :key="s"
        :label="t(`complaints.status_${s}`)"
        :color="status === s ? 'primary' : 'neutral'"
        :variant="status === s ? 'subtle' : 'ghost'"
        size="sm"
        @click="status = s"
      />
    </div>

    <UEmpty
      v-if="!complaints?.length"
      icon="i-lucide-flag"
      :title="t('admin.no_complaints_title')"
    />

    <div v-else class="divide-y divide-default">
      <div v-for="complaint in complaints" :key="complaint.id" class="py-4">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="font-medium text-highlighted">{{ complaint.reason }}</p>
            <p v-if="complaint.details" class="text-sm text-toned mt-1">{{ complaint.details }}</p>
            <p class="text-sm text-dimmed mt-1">
              {{ t('complaints.reported_by', { name: complaint.reporter.name }) }} ·
              {{ formatRelativeDate(complaint.createdAt) }}
            </p>
            <NuxtLink
              v-if="complaint.targetListing"
              :to="`/listings/${complaint.targetListing.id}`"
              target="_blank"
              class="text-sm text-primary hover:underline"
            >
              {{ complaint.targetListing.title }}
            </NuxtLink>
            <p v-if="complaint.resolutionNote" class="text-sm text-dimmed mt-1">
              {{ t('complaints.resolution_note_label') }}: {{ complaint.resolutionNote }}
            </p>
          </div>
        </div>

        <form
          v-if="complaint.status === 'open' || complaint.status === 'in_review'"
          class="flex flex-wrap items-center gap-2 mt-3"
          @submit.prevent="respond(complaint.id)"
        >
          <USelect
            v-model="respondStatus[complaint.id]"
            :items="respondStatusOptions"
            class="w-40"
          />
          <UInput
            v-model="respondNote[complaint.id]"
            class="flex-1 min-w-48"
            :placeholder="t('complaints.resolution_note_placeholder')"
          />
          <UButton type="submit" size="sm" :loading="actingId === complaint.id">
            {{ t('complaints.respond') }}
          </UButton>
        </form>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { AdminComplaint } from '#shared/types/models';

definePageMeta({ middleware: 'admin' });

const { t } = useI18n();
const toast = useToast();

const statuses = ['open', 'in_review', 'resolved', 'dismissed'] as const;
const status = ref<(typeof statuses)[number]>('open');

const { data: complaints, refresh } = await useFetch<AdminComplaint[]>('/api/admin/complaints', {
  query: { status }
});

const respondStatusOptions = [
  { label: t('complaints.status_in_review'), value: 'in_review' },
  { label: t('complaints.status_resolved'), value: 'resolved' },
  { label: t('complaints.status_dismissed'), value: 'dismissed' }
];

const respondStatus = reactive<Record<string, string>>({});
const respondNote = reactive<Record<string, string>>({});
const actingId = ref<string | null>(null);

async function respond(id: string) {
  actingId.value = id;
  try {
    await $fetch(`/api/admin/complaints/${id}/respond`, {
      method: 'POST',
      body: {
        status: respondStatus[id] || 'resolved',
        resolutionNote: respondNote[id] || undefined
      }
    });
    toast.add({ title: t('complaints.responded'), color: 'success' });
    await refresh();
  } catch (err) {
    toast.add({ title: t('admin.action_failed'), description: getErrorMessage(err), color: 'error' });
  } finally {
    actingId.value = null;
  }
}
</script>
