<template>
  <UContainer class="py-8 max-w-2xl">
    <UButton
      to="/admin/conversations"
      icon="i-lucide-arrow-left"
      variant="ghost"
      color="neutral"
      class="mb-4"
    >
      {{ t('admin.back_to_conversations') }}
    </UButton>

    <UCard>
      <div class="space-y-3 max-h-[65vh] overflow-y-auto">
        <div
          v-for="message in thread?.messages"
          :key="message.id"
          class="flex"
          :class="message.senderId === thread?.buyerId ? 'justify-start' : 'justify-end'"
        >
          <div
            class="max-w-[75%] rounded-lg px-3 py-2 text-sm"
            :class="
              message.senderId === thread?.buyerId ? 'bg-elevated text-toned' : 'bg-primary text-inverted'
            "
          >
            {{ message.body }}
          </div>
        </div>
        <p v-if="!thread?.messages.length" class="text-center text-dimmed text-sm py-8">
          {{ t('account.no_messages_yet') }}
        </p>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import type { AdminConversationThread } from '#shared/types/models';

definePageMeta({ middleware: 'admin' });

const { t } = useI18n();
const route = useRoute();

const { data: thread } = await useFetch<AdminConversationThread>(
  `/api/admin/conversations/${route.params.id}/messages`
);
</script>
