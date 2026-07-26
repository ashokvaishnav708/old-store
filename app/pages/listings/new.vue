<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { listingSchema, type ListingInput } from '#shared/utils/schemas';
import type { ListingDetail } from '#shared/types/models';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const { data: categories } = useCategories();

const categoryOptions = computed(() =>
  (categories.value || []).map(c => ({ label: c.name, value: c.id }))
);
const conditionOptions = computed(() => [
  { label: t('conditions.new'), value: 'new' },
  { label: t('conditions.like_new'), value: 'like_new' },
  { label: t('conditions.used'), value: 'used' },
  { label: t('conditions.for_parts'), value: 'for_parts' }
]);

const state = reactive<Partial<ListingInput>>({
  title: '',
  description: '',
  price: undefined,
  currency: 'EUR',
  condition: 'used',
  categoryId: undefined,
  location: ''
});

const images = ref<File[]>([]);
const submitting = ref(false);

async function onSubmit(event: FormSubmitEvent<ListingInput>) {
  submitting.value = true;
  try {
    const listing = await $fetch<ListingDetail>('/api/listings', {
      method: 'POST',
      body: event.data
    });

    if (images.value.length) {
      const formData = new FormData();
      for (const file of images.value) formData.append('images', file);
      await $fetch(`/api/listings/${listing.id}/images`, { method: 'POST', body: formData });
    }

    toast.add({ title: t('listing.publish_success'), color: 'success' });
    router.push(`/listings/${listing.id}`);
  } catch (err) {
    toast.add({
      title: t('listing.publish_error'),
      description: getErrorMessage(err),
      color: 'error'
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <h1 class="text-2xl font-bold text-highlighted mb-6">{{ t('listing.post_new_ad') }}</h1>

    <UForm :schema="listingSchema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField :label="t('listing.title_label')" name="title" required>
        <UInput
          v-model="state.title"
          class="w-full"
          :placeholder="t('listing.title_placeholder')"
        />
      </UFormField>

      <UFormField :label="t('listing.category_label')" name="categoryId" required>
        <USelect
          v-model="state.categoryId"
          :items="categoryOptions"
          :placeholder="t('listing.category_placeholder')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('listing.condition_label')" name="condition" required>
        <USelect v-model="state.condition" :items="conditionOptions" class="w-full" />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField :label="t('listing.price_label')" name="price" required>
          <UInputNumber v-model="state.price" :min="0" class="w-full" />
        </UFormField>
        <UFormField :label="t('listing.currency_label')" name="currency">
          <UInput v-model="state.currency" maxlength="3" class="w-full uppercase" />
        </UFormField>
      </div>

      <UFormField :label="t('listing.location_label')" name="location">
        <UInput
          v-model="state.location"
          :placeholder="t('listing.location_placeholder')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('listing.description_label')" name="description" required>
        <UTextarea
          v-model="state.description"
          :rows="6"
          class="w-full"
          :placeholder="t('listing.description_placeholder')"
        />
      </UFormField>

      <UFormField
        :label="t('listing.photos_label')"
        name="images"
        :description="t('listing.photos_description')"
      >
        <UFileUpload
          v-model="images"
          multiple
          accept="image/*"
          :label="t('listing.drop_files')"
          :description="t('listing.browse_files')"
        />
      </UFormField>

      <UButton type="submit" block size="lg" :loading="submitting">
        {{ t('listing.publish') }}
      </UButton>
    </UForm>
  </UContainer>
</template>
