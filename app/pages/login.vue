<template>
  <UContainer class="min-h-[80vh] flex items-center justify-center">
    <UAuthForm
      :schema="loginSchema"
      :fields="fields"
      :title="t('auth.login_title')"
      :description="t('auth.login_description', { name: t('app.name') })"
      icon="i-lucide-store"
      :submit="{ label: t('auth.sign_in_label'), loading: submitting }"
      @submit="onSubmit"
    >
      <template #description>
        {{ t('auth.sign_up_prompt') }}
        <ULink to="/register" class="text-primary font-medium">{{ t('auth.sign_up_link') }}</ULink>
      </template>
      <template #footer>
        <ULink to="/forgot-password" class="text-sm text-dimmed hover:text-primary">
          {{ t('auth.forgot_password_link') }}
        </ULink>
      </template>
    </UAuthForm>
  </UContainer>
</template>

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
    label: t('auth.email_label'),
    placeholder: t('auth.email_placeholder'),
    required: true
  },
  {
    name: 'password',
    type: 'password' as const,
    label: t('auth.password_label'),
    placeholder: t('auth.password_placeholder'),
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
