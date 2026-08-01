<template>
  <UContainer class="min-h-[80vh] flex items-center justify-center">
    <UCard class="w-full max-w-sm text-center">
      <template v-if="status === 'pending'">
        <p class="text-dimmed">{{ t('common.loading') }}</p>
      </template>
      <template v-else-if="status === 'success'">
        <h1 class="text-xl font-bold text-highlighted mb-1">{{ t('auth.email_verified_title') }}</h1>
        <p class="text-sm text-dimmed mb-4">{{ t('auth.email_verified_description') }}</p>
        <UButton to="/" class="w-full justify-center">{{ t('home.browse_listings') }}</UButton>
      </template>
      <template v-else>
        <h1 class="text-xl font-bold text-highlighted mb-1">{{ t('auth.verification_failed') }}</h1>
        <UButton to="/login" class="w-full justify-center">{{ t('auth.sign_in_label') }}</UButton>
      </template>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const { loggedIn, fetch: refreshSession } = useUserSession();

const status = ref<'pending' | 'success' | 'error'>('pending');

const token = route.query.token as string | undefined;
if (!token) {
  status.value = 'error';
} else {
  try {
    await $fetch('/api/auth/verify-email', { method: 'POST', body: { token } });
    status.value = 'success';
    if (loggedIn.value) await refreshSession();
  } catch {
    status.value = 'error';
  }
}
</script>
