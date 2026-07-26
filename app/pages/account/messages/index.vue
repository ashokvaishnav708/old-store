<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-bold text-highlighted mb-6">{{ t('account.messages_title') }}</h1>

    <UEmpty
      v-if="!conversations?.length"
      icon="i-lucide-message-circle"
      :title="t('account.no_conversations_title')"
      :description="t('account.no_conversations_description')"
      :actions="[{ label: t('account.browse_listings'), to: '/search' }]"
    />

    <div v-else class="divide-y divide-default">
      <NuxtLink
        v-for="conversation in conversations"
        :key="conversation.id"
        :to="`/account/messages/${conversation.id}`"
        class="flex items-center justify-between py-4 gap-4 hover:bg-elevated/50 -mx-2 px-2 rounded-md"
      >
        <div class="min-w-0">
          <p class="font-medium text-highlighted truncate">
            {{ conversation.listing.title }}
          </p>
          <p class="text-sm text-dimmed truncate">
            {{ conversation.isSeller ? conversation.buyer.name : t('account.seller') }} ·
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
import type { ConversationSummary } from '#shared/types/models';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const { data: conversations } = await useFetch<ConversationSummary[]>('/api/conversations');
</script>
