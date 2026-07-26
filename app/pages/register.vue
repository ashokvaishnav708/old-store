<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { registerSchema, type RegisterInput } from '#shared/utils/schemas';

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const { fetch: refreshSession } = useUserSession();

const fields = computed(() => [
  {
    name: 'name',
    type: 'text' as const,
    label: t('auth.nameLabel'),
    placeholder: t('auth.namePlaceholder'),
    required: true
  },
  {
    name: 'email',
    type: 'text' as const,
    label: t('auth.emailLabel'),
    placeholder: t('auth.emailPlaceholder'),
    required: true
  },
  {
    name: 'password',
    type: 'password' as const,
    label: t('auth.passwordLabel'),
    placeholder: t('auth.passwordPlaceholderMin'),
    required: true
  }
]);

const submitting = ref(false);
async function onSubmit(event: FormSubmitEvent<RegisterInput>) {
  submitting.value = true;
  try {
    await $fetch('/api/auth/register', { method: 'POST', body: event.data });
    await refreshSession();
    router.push('/');
  } catch (err) {
    toast.add({ title: t('auth.signUpError'), description: getErrorMessage(err), color: 'error' });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <UContainer class="min-h-[80vh] flex items-center justify-center">
    <UAuthForm
      :schema="registerSchema"
      :fields="fields"
      :title="t('auth.registerTitle')"
      :description="t('auth.registerDescription', { name: t('app.name') })"
      icon="i-lucide-store"
      :submit="{ label: t('auth.signUpLabel'), loading: submitting }"
      @submit="onSubmit"
    >
      <template #description>
        {{ t('auth.signInPrompt') }}
        <ULink to="/login" class="text-primary font-medium">{{ t('auth.signInLink') }}</ULink>
      </template>
    </UAuthForm>
  </UContainer>
</template>
