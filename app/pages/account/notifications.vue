<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-highlighted">{{ t('notifications.title') }}</h1>
      <UButton
        v-if="notifications?.some(n => !n.readAt)"
        size="sm"
        variant="ghost"
        @click="markAllRead"
      >
        {{ t('notifications.mark_all_read') }}
      </UButton>
    </div>

    <UEmpty
      v-if="!notifications?.length"
      icon="i-lucide-bell"
      :title="t('notifications.empty')"
    />

    <div v-else class="divide-y divide-default">
      <button
        v-for="notification in notifications"
        :key="notification.id"
        class="w-full text-left py-4 flex items-start justify-between gap-4 hover:bg-elevated/50 -mx-2 px-2 rounded-md"
        @click="openNotification(notification)"
      >
        <div class="min-w-0">
          <p class="font-medium text-highlighted flex items-center gap-2">
            <span v-if="!notification.readAt" class="size-2 rounded-full bg-primary shrink-0" />
            {{ notification.title }}
          </p>
          <p v-if="notification.body" class="text-sm text-dimmed mt-0.5">{{ notification.body }}</p>
        </div>
        <span class="text-xs text-dimmed shrink-0">{{ formatRelativeDate(notification.createdAt) }}</span>
      </button>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { NotificationItem } from '#shared/types/models';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const router = useRouter();

const { data: notifications, refresh } = await useFetch<NotificationItem[]>('/api/notifications', {
  query: { limit: 50 }
});

async function markAllRead() {
  await $fetch('/api/notifications/read-all', { method: 'POST' });
  await refresh();
}

async function openNotification(notification: NotificationItem) {
  if (!notification.readAt) {
    await $fetch(`/api/notifications/${notification.id}/read`, { method: 'POST' });
  }
  if (notification.link) router.push(notification.link);
  else await refresh();
}
</script>
