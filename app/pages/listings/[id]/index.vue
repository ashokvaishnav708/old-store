<template>
  <UContainer v-if="listing" class="py-8">
    <div class="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
      <div class="space-y-3">
        <div class="aspect-4/3 bg-muted rounded-lg overflow-hidden">
          <img
            v-if="listing.images.length"
            :src="listing.images[activeImage]?.url"
            :alt="listing.title"
            class="w-full h-full object-contain"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-lucide-image-off" class="size-12 text-dimmed" />
          </div>
        </div>
        <div v-if="listing.images.length > 1" class="flex gap-2 overflow-x-auto">
          <button
            v-for="(image, index) in listing.images"
            :key="image.id"
            class="shrink-0 size-16 rounded-md overflow-hidden ring-2"
            :class="index === activeImage ? 'ring-primary' : 'ring-transparent'"
            @click="activeImage = index"
          >
            <img :src="image.url" class="w-full h-full object-cover" />
          </button>
        </div>

        <div v-if="listing.images.length" class="space-y-4">
          <template v-for="entry in galleryEntries" :key="entry.key">
            <img
              v-if="entry.image"
              :src="entry.image.url"
              :alt="listing.title"
              class="w-full rounded-lg object-contain"
            />
            <GoogleAd v-else placement="in-content" format="fluid" layout="in-article" min-height="250px" />
          </template>
        </div>

        <UPageSection :title="t('listing.description_label')" :ui="{ container: 'py-4' }">
          <p class="whitespace-pre-line text-toned">
            {{ listing.description }}
          </p>
        </UPageSection>

        <GoogleAd placement="in-content" format="fluid" layout="in-article" min-height="250px" />
      </div>

      <div class="space-y-4">
        <UCard :class="listing.highlightBoost ? 'ring-2 ring-red-500' : ''">
          <div class="space-y-3">
            <UBadge color="neutral" variant="subtle">
              {{ listing.category.name }}
            </UBadge>
            <UBadge v-if="listing.highlightBoost" color="error" variant="subtle">
              {{ t('listing.boost_highlight') }}
            </UBadge>
            <h1 class="text-2xl font-bold text-highlighted">
              {{ listing.title }}
            </h1>
            <p class="text-3xl font-bold text-primary">
              {{ formatPrice(listing.price, listing.currency) }}
            </p>
            <div class="flex flex-wrap gap-2 text-sm text-dimmed">
              <span v-if="!loggedIn" class="flex items-center gap-1">
                <UIcon name="i-lucide-map-pin" />
                <ULink to="/login" class="text-primary">{{ t('listing.sign_in_to_view_location') }}</ULink>
              </span>
              <span v-else-if="listing.location" class="flex items-center gap-1">
                <UIcon name="i-lucide-map-pin" /> {{ listing.location }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-eye" /> {{ t('listing.views', { count: listing.viewCount }) }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-clock" /> {{ formatRelativeDate(listing.createdAt) }}
              </span>
            </div>

            <template v-if="!isOwner">
              <UButton
                v-if="loggedIn"
                block
                icon="i-lucide-message-circle"
                :loading="contacting"
                @click="contactSeller"
              >
                {{ t('listing.contact_seller') }}
              </UButton>
              <UButton
                v-else
                block
                color="neutral"
                variant="outline"
                icon="i-lucide-lock"
                to="/login"
              >
                {{ t('listing.sign_in_to_contact') }}
              </UButton>
              <UButton
                block
                color="neutral"
                variant="outline"
                :loading="favoriting"
                :icon="isFavorite ? 'i-lucide-heart-off' : 'i-lucide-heart'"
                @click="toggleFavorite"
              >
                {{ isFavorite ? t('listing.remove_favorite') : t('listing.save_to_favorites') }}
              </UButton>
              <UButton
                block
                color="neutral"
                variant="ghost"
                icon="i-lucide-flag"
                @click="showReportForm = !showReportForm"
              >
                {{ t('listing.report_action') }}
              </UButton>
              <form v-if="showReportForm" class="space-y-2" @submit.prevent="submitReport">
                <UInput
                  v-model="reportReason"
                  class="w-full"
                  :placeholder="t('complaints.reason_placeholder')"
                  required
                />
                <UTextarea
                  v-model="reportDetails"
                  class="w-full"
                  :rows="3"
                  :placeholder="t('complaints.details_placeholder')"
                />
                <UButton type="submit" block size="sm" :loading="reporting">
                  {{ t('complaints.submit') }}
                </UButton>
              </form>
            </template>
            <template v-else>
              <UButton block icon="i-lucide-pencil" :to="`/listings/${listing.id}/edit`">
                {{ t('listing.edit') }}
              </UButton>
              <UButton
                block
                color="error"
                variant="outline"
                icon="i-lucide-trash-2"
                @click="deleteListing"
              >
                {{ t('listing.delete') }}
              </UButton>
            </template>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-3">
            <UAvatar :alt="listing.seller.name" />
            <div>
              <p class="font-medium text-highlighted">
                {{ listing.seller.name }}
              </p>
              <p class="text-xs text-dimmed">
                {{
                  t('listing.member_since', {
                    year: new Date(listing.seller.createdAt).getFullYear()
                  })
                }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { FavoriteListing, ListingDetail } from '#shared/types/models';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { loggedIn, user } = useUserSession();

const { data: listing, error } = await useFetch<ListingDetail>(`/api/listings/${route.params.id}`);

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Listing not found', fatal: true });
}

const isOwner = computed(() => loggedIn.value && user.value?.id === listing.value?.seller.id);

const isFavorite = ref(false);
if (loggedIn.value && !isOwner.value) {
  const favorites = await $fetch<FavoriteListing[]>('/api/favorites').catch(() => []);
  isFavorite.value = favorites.some(f => f.listingId === listing.value?.id);
}
const favoriting = ref(false);
async function toggleFavorite() {
  if (!loggedIn.value) return router.push({ path: '/login', query: { redirect: route.fullPath } });
  favoriting.value = true;
  try {
    if (isFavorite.value) {
      await $fetch(`/api/favorites/${listing.value!.id}`, { method: 'DELETE' });
    } else {
      await $fetch(`/api/favorites/${listing.value!.id}`, { method: 'POST' });
    }
    isFavorite.value = !isFavorite.value;
  } finally {
    favoriting.value = false;
  }
}

const contacting = ref(false);
async function contactSeller() {
  if (!loggedIn.value) return router.push({ path: '/login', query: { redirect: route.fullPath } });
  contacting.value = true;
  try {
    const conversation = await $fetch('/api/conversations', {
      method: 'POST',
      body: { listingId: listing.value!.id }
    });
    router.push(`/account/messages/${conversation.id}`);
  } catch (err) {
    toast.add({
      title: t('listing.contact_error'),
      description: getErrorMessage(err),
      color: 'error'
    });
  } finally {
    contacting.value = false;
  }
}

async function deleteListing() {
  const url: string = `/api/listings/${listing.value!.id}`;
  await $fetch(url, { method: 'DELETE' });
  toast.add({ title: t('listing.delete_success'), color: 'success' });
  router.push('/account/listings');
}

const activeImage = ref(0);

const galleryEntries = computed(() => {
  const images = listing.value?.images ?? [];
  const result: Array<{ key: string; image?: { id: string; url: string } }> = [];
  images.forEach((image, index) => {
    result.push({ key: image.id, image });
    if ((index + 1) % 2 === 0) {
      result.push({ key: `ad-${image.id}` });
    }
  });
  if (images.length % 2 !== 0) {
    result.push({ key: `ad-final-${images[images.length - 1]!.id}` });
  }
  return result;
});

const showReportForm = ref(false);
const reportReason = ref('');
const reportDetails = ref('');
const reporting = ref(false);
async function submitReport() {
  if (!loggedIn.value) return router.push({ path: '/login', query: { redirect: route.fullPath } });
  if (!reportReason.value.trim()) return;
  reporting.value = true;
  try {
    await $fetch('/api/complaints', {
      method: 'POST',
      body: {
        targetListingId: listing.value!.id,
        reason: reportReason.value,
        details: reportDetails.value || undefined
      }
    });
    toast.add({ title: t('complaints.submitted'), color: 'success' });
    showReportForm.value = false;
    reportReason.value = '';
    reportDetails.value = '';
  } catch (err) {
    toast.add({ title: t('complaints.submit_error'), description: getErrorMessage(err), color: 'error' });
  } finally {
    reporting.value = false;
  }
}
</script>
