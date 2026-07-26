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
    label: t('auth.name_label'),
    placeholder: t('auth.name_placeholder'),
    required: true
  },
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
    placeholder: t('auth.password_placeholder_min'),
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
    toast.add({
      title: t('auth.sign_up_error'),
      description: getErrorMessage(err),
      color: 'error'
    });
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
      :title="t('auth.register_title')"
      :description="t('auth.register_description', { name: t('app.name') })"
      icon="i-lucide-store"
      :submit="{ label: t('auth.sign_up_label'), loading: submitting }"
      @submit="onSubmit"
    >
      <template #description>
        {{ t('auth.sign_in_prompt') }}
        <ULink to="/login" class="text-primary font-medium">{{ t('auth.sign_in_link') }}</ULink>
      </template>
    </UAuthForm>
  </UContainer>
</template>
