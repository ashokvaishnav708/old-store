<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { listingUpdateSchema, type ListingUpdateInput } from '#shared/utils/schemas';
import type { ListingDetail } from '#shared/types/models';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { user } = useUserSession();
const { data: categories } = useCategories();

const { data: listing } = await useFetch<ListingDetail>(`/api/listings/${route.params.id}`);

if (!listing.value || listing.value.seller.id !== user.value?.id) {
  throw createError({ statusCode: 403, statusMessage: 'Not your listing', fatal: true });
}

const categoryOptions = computed(() =>
  (categories.value || []).map(c => ({ label: c.name, value: c.id }))
);
const conditionOptions = computed(() => [
  { label: t('conditions.new'), value: 'new' },
  { label: t('conditions.like_new'), value: 'like_new' },
  { label: t('conditions.used'), value: 'used' },
  { label: t('conditions.for_parts'), value: 'for_parts' }
]);
const statusOptions = computed(() => [
  { label: t('statuses.active'), value: 'active' },
  { label: t('statuses.sold'), value: 'sold' },
  { label: t('statuses.archived'), value: 'archived' }
]);

const state = reactive<Partial<ListingUpdateInput>>({
  title: listing.value.title,
  description: listing.value.description,
  price: Number(listing.value.price),
  currency: listing.value.currency,
  condition: listing.value.condition as ListingUpdateInput['condition'],
  categoryId: listing.value.category.id,
  location: listing.value.location || '',
  status: listing.value.status as ListingUpdateInput['status']
});

const newImages = ref<File[]>([]);
const submitting = ref(false);
const deletingImage = ref<string | null>(null);

async function removeImage(imageId: string) {
  deletingImage.value = imageId;
  try {
    await $fetch(`/api/listings/${listing.value!.id}/images/${imageId}`, { method: 'DELETE' });
    listing.value!.images = listing.value!.images.filter(img => img.id !== imageId);
  } finally {
    deletingImage.value = null;
  }
}

async function onSubmit(event: FormSubmitEvent<ListingUpdateInput>) {
  submitting.value = true;
  try {
    const url: string = `/api/listings/${listing.value!.id}`;
    await $fetch(url, { method: 'PATCH', body: event.data });

    if (newImages.value.length) {
      const formData = new FormData();
      for (const file of newImages.value) formData.append('images', file);
      await $fetch(`/api/listings/${listing.value!.id}/images`, { method: 'POST', body: formData });
    }

    toast.add({ title: t('listing.updateSuccess'), color: 'success' });
    router.push(`/listings/${listing.value!.id}`);
  } catch (err) {
    toast.add({
      title: t('listing.updateError'),
      description: getErrorMessage(err),
      color: 'error'
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <UContainer v-if="listing" class="py-8 max-w-2xl">
    <h1 class="text-2xl font-bold text-highlighted mb-6">{{ t('listing.editListing') }}</h1>

    <div v-if="listing.images.length" class="grid grid-cols-4 gap-2 mb-6">
      <div
        v-for="image in listing.images"
        :key="image.id"
        class="relative aspect-square rounded-md overflow-hidden group"
      >
        <img :src="image.url" class="w-full h-full object-cover" />
        <UButton
          icon="i-lucide-x"
          size="xs"
          color="error"
          variant="solid"
          class="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
          :loading="deletingImage === image.id"
          @click="removeImage(image.id)"
        />
      </div>
    </div>

    <UForm :schema="listingUpdateSchema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField :label="t('listing.titleLabel')" name="title" required>
        <UInput v-model="state.title" class="w-full" />
      </UFormField>

      <UFormField :label="t('listing.categoryLabel')" name="categoryId" required>
        <USelect v-model="state.categoryId" :items="categoryOptions" class="w-full" />
      </UFormField>

      <UFormField :label="t('listing.statusLabel')" name="status" required>
        <USelect v-model="state.status" :items="statusOptions" class="w-full" />
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
        <UInput v-model="state.location" class="w-full" />
      </UFormField>

      <UFormField :label="t('listing.descriptionLabel')" name="description" required>
        <UTextarea v-model="state.description" :rows="6" class="w-full" />
      </UFormField>

      <UFormField :label="t('listing.addPhotosLabel')" name="images">
        <UFileUpload
          v-model="newImages"
          multiple
          accept="image/*"
          :label="t('listing.dropFiles')"
          :description="t('listing.browseFiles')"
        />
      </UFormField>

      <UButton type="submit" block size="lg" :loading="submitting">
        {{ t('listing.saveChanges') }}
      </UButton>
    </UForm>
  </UContainer>
</template>
