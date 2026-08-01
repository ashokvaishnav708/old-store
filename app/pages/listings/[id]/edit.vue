<template>
  <UContainer v-if="listing" class="py-8 max-w-2xl">
    <h1 class="text-2xl font-bold text-highlighted mb-6">{{ t('listing.edit_listing') }}</h1>

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

    <UCard class="mb-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p class="text-sm text-dimmed">{{ t('listing.plan_label') }}</p>
          <p class="font-medium text-highlighted">
            {{ t(`listing.plan_${listing.planId}`) }}
            <span v-if="listing.expiresAt" class="text-sm text-dimmed font-normal">
              · {{ t('listing.expires_on', { date: new Date(listing.expiresAt).toLocaleDateString() }) }}
            </span>
          </p>
        </div>
        <div v-if="upgradeOptions.length" class="flex gap-2">
          <UButton
            v-for="p in upgradeOptions"
            :key="p"
            size="sm"
            variant="subtle"
            :loading="upgrading === p"
            @click="upgradePlan(p)"
          >
            {{ t('listing.upgrade_to', { plan: t(`listing.plan_${p}`) }) }}
          </UButton>
        </div>
      </div>
    </UCard>

    <UForm :schema="listingUpdateSchema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField :label="t('listing.title_label')" name="title" required>
        <UInput v-model="state.title" class="w-full" />
      </UFormField>

      <UFormField :label="t('listing.category_label')" name="categoryId" required>
        <USelect v-model="state.categoryId" :items="categoryOptions" class="w-full" />
      </UFormField>

      <UFormField
        v-if="listing.status === 'active' || listing.status === 'sold' || listing.status === 'archived'"
        :label="t('listing.status_label')"
        name="status"
      >
        <USelect v-model="state.status" :items="statusOptions" class="w-full" />
      </UFormField>
      <p v-else-if="listing.status === 'pending'" class="text-sm text-dimmed">
        {{ t('listing.pending_review_notice') }}
      </p>
      <p v-else-if="listing.status === 'rejected'" class="text-sm text-error">
        {{ t('admin.rejection_reason_label') }}: {{ listing.rejectionReason }}
      </p>

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
        <UInput v-model="state.location" class="w-full" />
      </UFormField>

      <UFormField :label="t('listing.description_label')" name="description" required>
        <UTextarea v-model="state.description" :rows="6" class="w-full" />
      </UFormField>

      <UFormField :label="t('listing.add_photos_label')" name="images">
        <UFileUpload
          v-model="newImages"
          multiple
          accept="image/*"
          :label="t('listing.drop_files')"
          :description="t('listing.browse_files')"
        />
      </UFormField>

      <UButton type="submit" block size="lg" :loading="submitting">
        {{ t('listing.save_changes') }}
      </UButton>
    </UForm>
  </UContainer>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { listingUpdateSchema, type ListingUpdateInput } from '#shared/utils/schemas';
import type { ListingDetail } from '#shared/types/models';
import type { ListingPlan } from '#shared/utils/plans';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { user } = useUserSession();
const { data: categories } = useCategories();

const { data: listing } = await useLazyFetch<ListingDetail>(`/api/listings/${route.params.id}`);

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
  { label: t('conditions.use_marks'), value: 'use_marks' },
  { label: t('conditions.defect'), value: 'defect' }
]);
const statusOptions = computed(() => [
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
  status:
    listing.value.status === 'sold' || listing.value.status === 'archived'
      ? (listing.value.status as ListingUpdateInput['status'])
      : undefined
});

const newImages = ref<File[]>([]);
const submitting = ref(false);
const deletingImage = ref<string | null>(null);

const planOrder: ListingPlan[] = ['basic', 'pro', 'ultra'];
const upgradeOptions = computed<ListingPlan[]>(() => {
  const currentIndex = planOrder.indexOf(listing.value!.planId as ListingPlan);
  return planOrder.slice(currentIndex + 1);
});

const upgrading = ref<ListingPlan | null>(null);
async function upgradePlan(plan: ListingPlan) {
  upgrading.value = plan;
  try {
    const payment = await $fetch('/api/payments', {
      method: 'POST',
      body: { listingId: listing.value!.id, plan }
    });
    await $fetch(`/api/payments/${payment.id}/confirm`, { method: 'POST' });
    toast.add({ title: t('listing.plan_upgraded'), color: 'success' });
    await refreshNuxtData();
  } catch (err) {
    toast.add({ title: t('listing.update_error'), description: getErrorMessage(err), color: 'error' });
  } finally {
    upgrading.value = null;
  }
}

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

    toast.add({ title: t('listing.update_success'), color: 'success' });
    router.push(`/listings/${listing.value!.id}`);
  } catch (err) {
    toast.add({
      title: t('listing.update_error'),
      description: getErrorMessage(err),
      color: 'error'
    });
  } finally {
    submitting.value = false;
  }
}
</script>
