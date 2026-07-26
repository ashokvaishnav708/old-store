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

    toast.add({ title: t('listing.publishSuccess'), color: 'success' });
    router.push(`/listings/${listing.id}`);
  } catch (err) {
    toast.add({
      title: t('listing.publishError'),
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
    <h1 class="text-2xl font-bold text-highlighted mb-6">{{ t('listing.postNewAd') }}</h1>

    <UForm :schema="listingSchema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField :label="t('listing.titleLabel')" name="title" required>
        <UInput v-model="state.title" class="w-full" :placeholder="t('listing.titlePlaceholder')" />
      </UFormField>

      <UFormField :label="t('listing.categoryLabel')" name="categoryId" required>
        <USelect
          v-model="state.categoryId"
          :items="categoryOptions"
          :placeholder="t('listing.categoryPlaceholder')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('listing.conditionLabel')" name="condition" required>
        <USelect v-model="state.condition" :items="conditionOptions" class="w-full" />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField :label="t('listing.priceLabel')" name="price" required>
          <UInputNumber v-model="state.price" :min="0" class="w-full" />
        </UFormField>
        <UFormField :label="t('listing.currencyLabel')" name="currency">
          <UInput v-model="state.currency" maxlength="3" class="w-full uppercase" />
        </UFormField>
      </div>

      <UFormField :label="t('listing.locationLabel')" name="location">
        <UInput
          v-model="state.location"
          :placeholder="t('listing.locationPlaceholder')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('listing.descriptionLabel')" name="description" required>
        <UTextarea
          v-model="state.description"
          :rows="6"
          class="w-full"
          :placeholder="t('listing.descriptionPlaceholder')"
        />
      </UFormField>

      <UFormField
        :label="t('listing.photosLabel')"
        name="images"
        :description="t('listing.photosDescription')"
      >
        <UFileUpload
          v-model="images"
          multiple
          accept="image/*"
          :label="t('listing.dropFiles')"
          :description="t('listing.browseFiles')"
        />
      </UFormField>

      <UButton type="submit" block size="lg" :loading="submitting">
        {{ t('listing.publish') }}
      </UButton>
    </UForm>
  </UContainer>
</template>
