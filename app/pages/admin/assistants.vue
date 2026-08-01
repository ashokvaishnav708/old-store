<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-highlighted">{{ t('admin.assistants_title') }}</h1>
      <UButton icon="i-lucide-plus" @click="showForm = !showForm">
        {{ t('admin.add_assistant') }}
      </UButton>
    </div>
    <AdminNav />

    <UCard v-if="showForm" class="mb-6">
      <form class="grid sm:grid-cols-2 gap-3" @submit.prevent="createAssistant">
        <UInput v-model="form.firstName" :placeholder="t('auth.first_name_label')" required />
        <UInput v-model="form.lastName" :placeholder="t('auth.last_name_label')" required />
        <UInput v-model="form.email" type="email" :placeholder="t('auth.email_label')" required />
        <UInput
          v-model="form.password"
          type="password"
          :placeholder="t('auth.password_placeholder_min')"
          required
        />
        <UButton type="submit" class="sm:col-span-2 justify-center" :loading="creating">
          {{ t('admin.add_assistant') }}
        </UButton>
      </form>
    </UCard>

    <UEmpty v-if="!assistants?.length" icon="i-lucide-users" :title="t('admin.no_assistants_title')" />

    <div v-else class="divide-y divide-default">
      <div v-for="assistant in assistants" :key="assistant.id" class="flex items-center justify-between py-4 gap-4">
        <div class="min-w-0">
          <p class="font-medium text-highlighted">{{ assistant.name }}</p>
          <p class="text-sm text-dimmed">{{ assistant.email }}</p>
          <UBadge v-if="assistant.bannedAt" color="error" variant="subtle" class="mt-1">
            {{ t('admin.banned') }}
          </UBadge>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-lucide-mail"
            :loading="actingId === assistant.id"
            @click="resetPassword(assistant.id)"
          >
            {{ t('admin.reset_password') }}
          </UButton>
          <UButton
            v-if="!assistant.bannedAt"
            size="sm"
            color="error"
            variant="ghost"
            icon="i-lucide-ban"
            :loading="actingId === assistant.id"
            @click="ban(assistant.id)"
          >
            {{ t('admin.ban') }}
          </UButton>
          <UButton
            v-else
            size="sm"
            color="success"
            variant="ghost"
            icon="i-lucide-circle-check"
            :loading="actingId === assistant.id"
            @click="unban(assistant.id)"
          >
            {{ t('admin.unban') }}
          </UButton>
          <UButton
            size="sm"
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            :loading="actingId === assistant.id"
            @click="remove(assistant.id)"
          />
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { AdminAssistant } from '#shared/types/models';

definePageMeta({ middleware: 'admin' });

const { t } = useI18n();
const toast = useToast();

const { data: assistants, refresh } = await useFetch<AdminAssistant[]>('/api/admin/assistants');

const showForm = ref(false);
const creating = ref(false);
const form = reactive({ firstName: '', lastName: '', email: '', password: '' });

async function createAssistant() {
  creating.value = true;
  try {
    await $fetch('/api/admin/assistants', { method: 'POST', body: form });
    toast.add({ title: t('admin.assistant_added'), color: 'success' });
    showForm.value = false;
    form.firstName = '';
    form.lastName = '';
    form.email = '';
    form.password = '';
    await refresh();
  } catch (err) {
    toast.add({ title: t('admin.action_failed'), description: getErrorMessage(err), color: 'error' });
  } finally {
    creating.value = false;
  }
}

const actingId = ref<string | null>(null);

async function resetPassword(id: string) {
  actingId.value = id;
  try {
    await $fetch(`/api/admin/assistants/${id}/reset-password`, { method: 'POST' });
    toast.add({ title: t('admin.reset_password_sent'), color: 'success' });
  } catch (err) {
    toast.add({ title: t('admin.action_failed'), description: getErrorMessage(err), color: 'error' });
  } finally {
    actingId.value = null;
  }
}

async function ban(id: string) {
  actingId.value = id;
  try {
    await $fetch(`/api/admin/assistants/${id}/ban`, { method: 'POST', body: {} });
    await refresh();
  } catch (err) {
    toast.add({ title: t('admin.action_failed'), description: getErrorMessage(err), color: 'error' });
  } finally {
    actingId.value = null;
  }
}

async function unban(id: string) {
  actingId.value = id;
  try {
    await $fetch(`/api/admin/assistants/${id}/unban`, { method: 'POST' });
    await refresh();
  } catch (err) {
    toast.add({ title: t('admin.action_failed'), description: getErrorMessage(err), color: 'error' });
  } finally {
    actingId.value = null;
  }
}

async function remove(id: string) {
  actingId.value = id;
  try {
    await $fetch(`/api/admin/assistants/${id}`, { method: 'DELETE' });
    toast.add({ title: t('admin.assistant_removed'), color: 'success' });
    await refresh();
  } catch (err) {
    toast.add({ title: t('admin.action_failed'), description: getErrorMessage(err), color: 'error' });
  } finally {
    actingId.value = null;
  }
}
</script>
