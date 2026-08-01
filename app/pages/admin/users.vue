<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold text-highlighted mb-6">{{ t('admin.users_title') }}</h1>
    <AdminNav />

    <form class="flex gap-2 mb-6" @submit.prevent="search">
      <UInput
        v-model="email"
        icon="i-lucide-search"
        class="flex-1"
        :placeholder="t('admin.search_by_email_placeholder')"
      />
      <UButton type="submit" :loading="searching">{{ t('admin.search') }}</UButton>
    </form>

    <UEmpty
      v-if="searched && !results?.length"
      icon="i-lucide-user-search"
      :title="t('admin.no_users_found')"
    />

    <div v-else class="divide-y divide-default">
      <div v-for="result in results" :key="result.id" class="py-4">
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="font-medium text-highlighted">{{ result.name }}</p>
            <p class="text-sm text-dimmed">{{ result.email }} · {{ result.userType }}</p>
            <UBadge v-if="result.bannedAt" color="error" variant="subtle" class="mt-1">
              {{ t('admin.banned') }}{{ result.bannedReason ? `: ${result.bannedReason}` : '' }}
            </UBadge>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <UButton
              v-if="!result.bannedAt"
              size="sm"
              color="error"
              variant="ghost"
              icon="i-lucide-ban"
              :loading="actingId === result.id"
              @click="banningId = banningId === result.id ? null : result.id"
            >
              {{ t('admin.ban') }}
            </UButton>
            <UButton
              v-else
              size="sm"
              color="success"
              variant="ghost"
              icon="i-lucide-circle-check"
              :loading="actingId === result.id"
              @click="unban(result.email)"
            >
              {{ t('admin.unban') }}
            </UButton>
          </div>
        </div>

        <form
          v-if="banningId === result.id"
          class="flex gap-2 mt-3"
          @submit.prevent="ban(result.email)"
        >
          <UInput v-model="banReason" class="flex-1" :placeholder="t('admin.ban_reason_placeholder')" />
          <UButton type="submit" color="error" size="sm" :loading="actingId === result.id">
            {{ t('admin.confirm_ban') }}
          </UButton>
        </form>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { AdminUserSearchResult } from '#shared/types/models';

definePageMeta({ middleware: 'admin' });

const { t } = useI18n();
const toast = useToast();

const email = ref('');
const searching = ref(false);
const searched = ref(false);
const results = ref<AdminUserSearchResult[]>([]);

async function search() {
  if (!email.value.trim()) return;
  searching.value = true;
  try {
    results.value = await $fetch<AdminUserSearchResult[]>('/api/admin/users', {
      query: { email: email.value }
    });
    searched.value = true;
  } catch (err) {
    toast.add({ title: t('admin.action_failed'), description: getErrorMessage(err), color: 'error' });
  } finally {
    searching.value = false;
  }
}

const actingId = ref<string | null>(null);
const banningId = ref<string | null>(null);
const banReason = ref('');

async function ban(targetEmail: string) {
  const target = results.value.find(r => r.email === targetEmail);
  if (!target) return;
  actingId.value = target.id;
  try {
    await $fetch('/api/admin/users/ban', {
      method: 'POST',
      body: { email: targetEmail, reason: banReason.value || undefined }
    });
    banningId.value = null;
    banReason.value = '';
    await search();
  } catch (err) {
    toast.add({ title: t('admin.action_failed'), description: getErrorMessage(err), color: 'error' });
  } finally {
    actingId.value = null;
  }
}

async function unban(targetEmail: string) {
  const target = results.value.find(r => r.email === targetEmail);
  if (!target) return;
  actingId.value = target.id;
  try {
    await $fetch('/api/admin/users/unban', { method: 'POST', body: { email: targetEmail } });
    await search();
  } catch (err) {
    toast.add({ title: t('admin.action_failed'), description: getErrorMessage(err), color: 'error' });
  } finally {
    actingId.value = null;
  }
}
</script>
