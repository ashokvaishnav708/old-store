<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold text-highlighted mb-6">{{ t('admin.conversations_title') }}</h1>
    <AdminNav />

    <UEmpty
      v-if="!conversations?.length"
      icon="i-lucide-messages-square"
      :title="t('admin.no_conversations_title')"
    />

    <div v-else class="divide-y divide-default">
      <NuxtLink
        v-for="conversation in conversations"
        :key="conversation.id"
        :to="`/admin/conversations/${conversation.id}`"
        class="flex items-center justify-between py-4 gap-4 hover:bg-elevated/50 -mx-2 px-2 rounded-md"
      >
        <div class="min-w-0">
          <p class="font-medium text-highlighted truncate">{{ conversation.listing.title }}</p>
          <p class="text-sm text-dimmed truncate">
            {{ conversation.buyer.name }} → {{ conversation.seller.name }} ·
            {{ conversation.lastMessage || t('account.no_messages_preview') }}
          </p>
        </div>
        <span v-if="conversation.lastMessageAt" class="text-xs text-dimmed shrink-0">
          {{ formatRelativeDate(conversation.lastMessageAt) }}
        </span>
      </NuxtLink>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { AdminConversationSummary } from '#shared/types/models';

definePageMeta({ middleware: 'admin' });

const { t } = useI18n();
const { data: conversations } = await useFetch<AdminConversationSummary[]>('/api/admin/conversations');
</script>
