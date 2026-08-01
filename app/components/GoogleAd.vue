<template>
  <div v-if="clientId && slot" class="google-ad" :class="containerClass">
    <p class="text-[10px] uppercase tracking-wide text-dimmed text-center mb-1">
      {{ t('ads.label') }}
    </p>
    <client-only>
      <ins
        :key="slot"
        class="adsbygoogle block"
        :style="insStyle"
        :data-ad-client="clientId"
        :data-ad-slot="slot"
        :data-ad-format="format"
        :data-ad-layout="layout"
        :data-full-width-responsive="fullWidthResponsive ? 'true' : 'false'"
      />
    </client-only>
  </div>
</template>

<script setup lang="ts">
declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const props = withDefaults(
  defineProps<{
    placement: 'sidebar' | 'in-feed' | 'in-content';
    format?: string;
    layout?: string;
    fullWidthResponsive?: boolean;
    containerClass?: string;
    minHeight?: string;
  }>(),
  {
    format: 'auto',
    layout: undefined,
    fullWidthResponsive: true,
    containerClass: '',
    minHeight: undefined
  }
);

const { t } = useI18n();
const { public: publicConfig } = useRuntimeConfig();

const clientId = publicConfig.adsense.clientId;
const slot = computed(() => {
  switch (props.placement) {
    case 'sidebar':
      return publicConfig.adsense.slotSidebar;
    case 'in-feed':
      return publicConfig.adsense.slotInFeed;
    case 'in-content':
      return publicConfig.adsense.slotInContent;
    default:
      return '';
  }
});

const insStyle = computed(() => (props.minHeight ? { display: 'block', minHeight: props.minHeight } : { display: 'block' }));

onMounted(() => {
  if (!clientId || !slot.value) return;
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // AdSense throws if the script hasn't finished loading yet or the slot
    // was already initialized (e.g. during HMR) — safe to ignore.
  }
});
</script>
