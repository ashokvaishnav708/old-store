<script setup lang="ts">
import type { ListingSummary } from '#shared/types/models';

defineProps<{ listing: ListingSummary }>();
</script>

<template>
  <NuxtLink :to="`/listings/${listing.id}`" class="group block">
    <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden h-full">
      <div class="aspect-4/3 bg-muted overflow-hidden">
        <img
          v-if="listing.thumbnail"
          :src="listing.thumbnail"
          :alt="listing.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <UIcon name="i-lucide-image-off" class="size-8 text-dimmed" />
        </div>
      </div>
      <div class="p-3 space-y-1">
        <p class="font-semibold text-highlighted">
          {{ formatPrice(listing.price, listing.currency) }}
        </p>
        <p class="text-sm text-toned truncate">
          {{ listing.title }}
        </p>
        <div class="flex items-center justify-between text-xs text-dimmed">
          <span class="truncate">{{ listing.location || listing.category.name }}</span>
          <span class="shrink-0">{{ formatRelativeDate(listing.createdAt) }}</span>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
