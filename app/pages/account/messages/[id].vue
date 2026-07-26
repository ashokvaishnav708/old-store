<script setup lang="ts">
import type { MessageItem } from '#shared/types/models';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const route = useRoute();
const { user } = useUserSession();

const { data: messages, refresh } = await useFetch<MessageItem[]>(
  `/api/conversations/${route.params.id}/messages`
);

const draft = ref('');
const sending = ref(false);

async function send() {
  if (!draft.value.trim()) return;
  sending.value = true;
  try {
    await $fetch(`/api/conversations/${route.params.id}/messages`, {
      method: 'POST',
      body: { body: draft.value }
    });
    draft.value = '';
    await refresh();
  } finally {
    sending.value = false;
  }
}

const { pause } = useIntervalFn(() => refresh(), 5000);
onUnmounted(() => pause());
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <UButton
      to="/account/messages"
      icon="i-lucide-arrow-left"
      variant="ghost"
      color="neutral"
      class="mb-4"
    >
      {{ t('account.backToMessages') }}
    </UButton>

    <UCard class="mb-4">
      <div class="space-y-3 max-h-[50vh] overflow-y-auto">
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="message.senderId === user?.id ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[75%] rounded-lg px-3 py-2 text-sm"
            :class="
              message.senderId === user?.id ? 'bg-primary text-inverted' : 'bg-elevated text-toned'
            "
          >
            {{ message.body }}
          </div>
        </div>
        <p v-if="!messages?.length" class="text-center text-dimmed text-sm py-8">
          {{ t('account.noMessagesYet') }}
        </p>
      </div>
    </UCard>

    <form class="flex gap-2" @submit.prevent="send">
      <UInput v-model="draft" :placeholder="t('account.typeMessage')" class="flex-1" />
      <UButton type="submit" icon="i-lucide-send" :loading="sending" />
    </form>
  </UContainer>
</template>
