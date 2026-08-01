<template>
  <UContainer class="min-h-[80vh] flex items-center justify-center">
    <UCard class="w-full max-w-sm">
      <template v-if="!done">
        <h1 class="text-xl font-bold text-highlighted mb-1">{{ t('auth.reset_password_title') }}</h1>
        <p class="text-sm text-dimmed mb-4">{{ t('auth.reset_password_description') }}</p>
        <form class="space-y-3" @submit.prevent="onSubmit">
          <UInput
            v-model="password"
            type="password"
            :placeholder="t('auth.password_placeholder_min')"
            class="w-full"
            required
          />
          <UButton type="submit" class="w-full justify-center" :loading="submitting">
            {{ t('auth.reset_password_submit') }}
          </UButton>
        </form>
      </template>
      <template v-else>
        <h1 class="text-xl font-bold text-highlighted mb-1">{{ t('auth.reset_password_done_title') }}</h1>
        <p class="text-sm text-dimmed mb-4">{{ t('auth.reset_password_done_description') }}</p>
        <UButton to="/login" class="w-full justify-center">{{ t('auth.sign_in_label') }}</UButton>
      </template>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const toast = useToast();

const password = ref('');
const submitting = ref(false);
const done = ref(false);

async function onSubmit() {
  const token = route.query.token as string | undefined;
  if (!token) {
    toast.add({ title: t('auth.reset_link_invalid'), color: 'error' });
    return;
  }

  submitting.value = true;
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { token, password: password.value }
    });
    done.value = true;
  } catch (err) {
    toast.add({ title: t('auth.reset_link_invalid'), description: getErrorMessage(err), color: 'error' });
  } finally {
    submitting.value = false;
  }
}
</script>
