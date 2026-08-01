<template>
  <div :class="gridClass">
    <template v-for="entry in entries" :key="entry.key">
      <ListingCard v-if="entry.listing" :listing="entry.listing" />
      <GoogleAd
        v-else
        placement="in-feed"
        format="fluid"
        layout="in-article"
        min-height="250px"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ListingSummary } from '#shared/types/models';

const props = withDefaults(
  defineProps<{
    listings: ListingSummary[];
    gridClass?: string;
    adEvery?: number;
  }>(),
  {
    gridClass: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4',
    adEvery: 3
  }
);

const entries = computed(() => {
  const result: Array<{ key: string; listing?: ListingSummary }> = [];
  props.listings.forEach((listing, index) => {
    result.push({ key: listing.id, listing });
    if ((index + 1) % props.adEvery === 0) {
      result.push({ key: `ad-${listing.id}` });
    }
  });
  return result;
});
</script>
