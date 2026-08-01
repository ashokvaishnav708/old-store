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

      <UFormField :label="t('listing.plan_label')" :description="t('listing.plan_description')">
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="p in listingPlans"
            :key="p"
            type="button"
            class="rounded-lg border p-3 text-left transition"
            :class="plan === p ? 'border-primary ring-1 ring-primary' : 'border-default'"
            @click="plan = p"
          >
            <p class="font-medium text-highlighted">{{ t(`listing.plan_${p}`) }}</p>
            <p class="text-sm text-dimmed">
              {{ planPrices[p] === 0 ? t('listing.plan_free') : formatPrice(planPrices[p]) }}
            </p>
            <p class="text-xs text-dimmed">{{ t('listing.plan_days', { days: planDurationDays[p] }) }}</p>
          </button>
        </div>
      </UFormField>

      <UFormField
        v-if="isOrganisation"
        :label="t('listing.boosts_label')"
        :description="t('listing.boosts_description', { days: BOOST_DURATION_DAYS })"
      >
        <div class="space-y-2">
          <label
            v-for="b in advertisingBoosts"
            :key="b"
            class="flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition"
            :class="selectedBoosts.includes(b) ? 'border-primary ring-1 ring-primary' : 'border-default'"
          >
            <UCheckbox :model-value="selectedBoosts.includes(b)" @update:model-value="toggleBoost(b)" />
            <div>
              <p class="font-medium text-highlighted">{{ t(`listing.boost_${b}`) }}</p>
              <p class="text-sm text-dimmed">
                {{ t(`listing.boost_${b}_description`) }} · {{ formatPrice(boostPrices[b]) }}
              </p>
            </div>
          </label>
        </div>
      </UFormField>

      <UButton type="submit" block size="lg" :loading="submitting">
        {{ plan === 'basic' && !selectedBoosts.length ? t('listing.publish') : t('listing.pay_and_publish') }}
      </UButton>
    </UForm>
  </UContainer>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { listingSchema, type ListingInput } from '#shared/utils/schemas';
import type { ListingDetail } from '#shared/types/models';
import { listingPlans, planPrices, planDurationDays, type ListingPlan } from '#shared/utils/plans';
import { advertisingBoosts, boostPrices, BOOST_DURATION_DAYS, type AdvertisingBoost } from '#shared/utils/boosts';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const { data: categories } = useCategories();
const { user } = useUserSession();

const isOrganisation = computed(() => user.value?.userType === 'organisation');
const selectedBoosts = ref<AdvertisingBoost[]>([]);
function toggleBoost(boost: AdvertisingBoost) {
  const index = selectedBoosts.value.indexOf(boost);
  if (index === -1) selectedBoosts.value.push(boost);
  else selectedBoosts.value.splice(index, 1);
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

const plan = ref<ListingPlan>('basic');

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

    if (plan.value !== 'basic') {
      const payment = await $fetch('/api/payments', {
        method: 'POST',
        body: { listingId: listing.id, plan: plan.value }
      });
      await $fetch(`/api/payments/${payment.id}/confirm`, { method: 'POST' });
    }

    for (const boost of selectedBoosts.value) {
      const payment = await $fetch('/api/payments/boost', {
        method: 'POST',
        body: { listingId: listing.id, boost }
      });
      await $fetch(`/api/payments/${payment.id}/confirm`, { method: 'POST' });
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
