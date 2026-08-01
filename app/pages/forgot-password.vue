<template>
  <UContainer class="min-h-[80vh] flex items-center justify-center">
    <UCard class="w-full max-w-sm">
      <template v-if="!sent">
        <h1 class="text-xl font-bold text-highlighted mb-1">{{ t('auth.forgot_password_title') }}</h1>
        <p class="text-sm text-dimmed mb-4">{{ t('auth.forgot_password_description') }}</p>
        <form class="space-y-3" @submit.prevent="onSubmit">
          <UInput
            v-model="email"
            type="email"
            :placeholder="t('auth.email_placeholder')"
            class="w-full"
            required
          />
          <UButton type="submit" class="w-full justify-center" :loading="submitting">
            {{ t('auth.send_reset_link') }}
          </UButton>
        </form>
      </template>
      <template v-else>
        <h1 class="text-xl font-bold text-highlighted mb-1">{{ t('auth.reset_link_sent_title') }}</h1>
        <p class="text-sm text-dimmed">{{ t('auth.reset_link_sent_description') }}</p>
      </template>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
const { t } = useI18n();
const toast = useToast();

const email = ref('');
const submitting = ref(false);
const sent = ref(false);

async function onSubmit() {
  submitting.value = true;
  try {
    await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.value } });
    sent.value = true;
  } catch (err) {
    toast.add({
      title: t('auth.sign_in_error'),
      description: getErrorMessage(err),
      color: 'error'
    });
  } finally {
    submitting.value = false;
  }
}
</script>
