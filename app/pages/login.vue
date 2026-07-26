<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { loginSchema, type LoginInput } from '#shared/utils/schemas';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { fetch: refreshSession } = useUserSession();

const fields = computed(() => [
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
    placeholder: t('auth.passwordPlaceholder'),
    required: true
  }
]);

const submitting = ref(false);
async function onSubmit(event: FormSubmitEvent<LoginInput>) {
  submitting.value = true;
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: event.data });
    await refreshSession();
    router.push((route.query.redirect as string) || '/');
  } catch (err) {
    toast.add({ title: t('auth.signInError'), description: getErrorMessage(err), color: 'error' });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <UContainer class="min-h-[80vh] flex items-center justify-center">
    <UAuthForm
      :schema="loginSchema"
      :fields="fields"
      :title="t('auth.loginTitle')"
      :description="t('auth.loginDescription', { name: t('app.name') })"
      icon="i-lucide-store"
      :submit="{ label: t('auth.signInLabel'), loading: submitting }"
      @submit="onSubmit"
    >
      <template #description>
        {{ t('auth.signUpPrompt') }}
        <ULink to="/register" class="text-primary font-medium">{{ t('auth.signUpLink') }}</ULink>
      </template>
    </UAuthForm>
  </UContainer>
</template>
