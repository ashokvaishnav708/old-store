<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg text-highlighted">
          <UIcon name="i-lucide-store" class="size-6 text-primary" />
          {{ t('app.name') }}
        </NuxtLink>
      </template>

      <template #default>
        <UInput
          v-model="search"
          icon="i-lucide-search"
          :placeholder="t('nav.search_placeholder')"
          class="w-full max-w-md hidden sm:flex"
          @keyup.enter="submitSearch"
        />
      </template>

      <template #right>
        <UColorModeButton />

        <UButton to="/listings/new" icon="i-lucide-plus" color="primary">
          {{ t('nav.post_ad') }}
        </UButton>

        <UDropdownMenu v-if="loggedIn" :items="accountItems">
          <UAvatar :alt="user?.name" size="sm" class="cursor-pointer" />
        </UDropdownMenu>
        <UButton v-else to="/login" color="neutral" variant="ghost">
          {{ t('nav.sign_in') }}
        </UButton>
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          {{ t('nav.footer', { year: new Date().getFullYear(), name: t('app.name') }) }}
        </p>
      </template>
    </UFooter>
  </UApp>
</template>

<script setup lang="ts">
const { t, locale } = useI18n();

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: locale
  }
});

useSeoMeta({
  title: `${t('app.name')} — Buy & sell locally`,
  description: t('app.description'),
  ogTitle: t('app.name'),
  twitterCard: 'summary_large_image'
});

const { loggedIn, user, clear } = useUserSession();
const router = useRouter();

const accountItems = computed(() => [
  [
    { label: t('nav.my_listings'), icon: 'i-lucide-list', to: '/account/listings' },
    { label: t('nav.favorites'), icon: 'i-lucide-heart', to: '/account/favorites' },
    { label: t('nav.messages'), icon: 'i-lucide-message-circle', to: '/account/messages' }
  ],
  [
    {
      label: t('nav.sign_out'),
      icon: 'i-lucide-log-out',
      onSelect: async () => {
        await $fetch('/api/auth/logout', { method: 'POST' });
        await clear();
        router.push('/');
      }
    }
  ]
]);

const search = ref('');
function submitSearch() {
  router.push({ path: '/search', query: search.value ? { q: search.value } : {} });
}
</script>
