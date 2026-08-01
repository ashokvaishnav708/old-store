<template>
  <UContainer class="py-8 max-w-2xl">
    <h1 class="text-2xl font-bold text-highlighted mb-6">{{ t('account.profile_title') }}</h1>

    <UCard class="mb-6">
      <div class="flex items-center gap-3">
        <UAvatar :alt="user?.name" size="lg" />
        <div>
          <p class="font-medium text-highlighted">{{ user?.name }}</p>
          <p class="text-sm text-dimmed">{{ user?.email }}</p>
          <UBadge :color="user?.verified ? 'success' : 'warning'" variant="subtle" class="mt-1">
            {{ user?.verified ? t('account.email_verified') : t('account.email_unverified') }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <UCard class="mb-6">
      <p class="text-sm text-dimmed">{{ t('account.current_plan_label') }}</p>
      <p class="text-lg font-semibold text-highlighted">
        {{ t(`account.tier_${activeTier}`) }}
        <span v-if="activeTier !== 'basic' && user?.subscriptionExpiresAt" class="text-sm font-normal text-dimmed">
          · {{ t('account.upgrade_expires_on', { date: new Date(user.subscriptionExpiresAt).toLocaleDateString() }) }}
        </span>
      </p>
      <p class="text-sm text-dimmed mt-1">
        {{ t('account.listing_quota', { used: activeCount, limit: currentLimit }) }}
      </p>
    </UCard>

    <h2 class="text-lg font-semibold text-highlighted mb-3">{{ t('account.upgrade_title') }}</h2>
    <div class="grid sm:grid-cols-2 gap-4">
      <UCard
        v-for="tier in paidSubscriptionTiers"
        :key="tier"
        :class="activeTier === tier ? 'ring-2 ring-primary' : ''"
      >
        <p class="font-semibold text-highlighted">{{ t(`account.tier_${tier}`) }}</p>
        <p class="text-2xl font-bold text-primary mt-1">{{ formatPrice(subscriptionPrices[tier]) }}</p>
        <p class="text-sm text-dimmed mt-1">
          {{ t('account.upgrade_summary', { limit: subscriptionListingLimits[tier], days: SUBSCRIPTION_DURATION_DAYS }) }}
        </p>
        <UButton
          block
          class="mt-4"
          :disabled="activeTier === tier"
          :loading="upgrading === tier"
          @click="upgrade(tier)"
        >
          {{ activeTier === tier ? t('account.current_plan_active') : t('account.upgrade_action') }}
        </UButton>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { MyListing } from '#shared/types/models';
import {
  paidSubscriptionTiers,
  subscriptionPrices,
  subscriptionListingLimits,
  SUBSCRIPTION_DURATION_DAYS,
  effectiveListingLimit,
  type PaidSubscriptionTier
} from '#shared/utils/subscriptions';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const toast = useToast();
const { user, fetch: refreshSession } = useUserSession();

const { data: listings } = await useFetch<MyListing[]>('/api/listings/mine');
const activeCount = computed(
  () => listings.value?.filter(l => l.status === 'pending' || l.status === 'active').length ?? 0
);

const activeTier = computed(() => {
  if (!user.value) return 'basic';
  const notExpired =
    user.value.subscriptionExpiresAt !== null && new Date(user.value.subscriptionExpiresAt) > new Date();
  return notExpired ? user.value.userSubscription : 'basic';
});

const currentLimit = computed(() => (user.value ? effectiveListingLimit(user.value) : 5));

const upgrading = ref<PaidSubscriptionTier | null>(null);
async function upgrade(tier: PaidSubscriptionTier) {
  upgrading.value = tier;
  try {
    const payment = await $fetch('/api/account/subscription', { method: 'POST', body: { tier } });
    await $fetch(`/api/payments/${payment.id}/confirm`, { method: 'POST' });
    await refreshSession();
    toast.add({ title: t('account.upgrade_success'), color: 'success' });
  } catch (err) {
    toast.add({ title: t('account.upgrade_error'), description: getErrorMessage(err), color: 'error' });
  } finally {
    upgrading.value = null;
  }
}
</script>
