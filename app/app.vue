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

        <UPopover v-if="loggedIn" v-model:open="notificationsOpen">
          <UChip :text="unreadCount" :show="unreadCount > 0" size="sm" color="error">
            <UButton icon="i-lucide-bell" color="neutral" variant="ghost" square />
          </UChip>

          <template #content>
            <div class="w-80 max-h-96 overflow-y-auto p-2">
              <div class="flex items-center justify-between px-2 py-1">
                <p class="text-sm font-medium text-highlighted">{{ t('notifications.title') }}</p>
                <UButton
                  v-if="unreadCount > 0"
                  size="xs"
                  variant="link"
                  @click="markAllRead"
                >
                  {{ t('notifications.mark_all_read') }}
                </UButton>
              </div>
              <p v-if="!notificationsList.length" class="text-sm text-dimmed text-center py-6">
                {{ t('notifications.empty') }}
              </p>
              <button
                v-for="notification in notificationsList"
                :key="notification.id"
                class="w-full text-left px-2 py-2 rounded-md hover:bg-elevated/50"
                :class="!notification.readAt ? 'bg-elevated/30' : ''"
                @click="openNotification(notification)"
              >
                <p class="text-sm font-medium text-highlighted">{{ notification.title }}</p>
                <p v-if="notification.body" class="text-xs text-dimmed truncate">{{ notification.body }}</p>
                <p class="text-xs text-dimmed mt-0.5">{{ formatRelativeDate(notification.createdAt) }}</p>
              </button>
              <div class="px-2 pt-1">
                <ULink to="/account/notifications" class="text-xs text-primary" @click="notificationsOpen = false">
                  {{ t('notifications.view_all') }}
                </ULink>
              </div>
            </div>
          </template>
        </UPopover>

        <UDropdownMenu v-if="loggedIn" :items="accountItems">
          <UAvatar :alt="user?.name" size="sm" class="cursor-pointer" />
        </UDropdownMenu>
        <UButton v-else to="/login" color="neutral" variant="ghost">
          {{ t('nav.sign_in') }}
        </UButton>
      </template>
    </UHeader>

    <UAlert
      v-if="loggedIn && user?.verified === false"
      color="warning"
      variant="subtle"
      icon="i-lucide-mail-warning"
      :title="t('auth.verify_email_banner')"
      :close="false"
      class="rounded-none"
    >
      <template #actions>
        <UButton
          size="xs"
          color="warning"
          variant="solid"
          :loading="resendingVerification"
          @click="resendVerification"
        >
          {{ t('auth.resend_verification') }}
        </UButton>
      </template>
    </UAlert>

    <GoogleAd
      placement="sidebar"
      format="vertical"
      container-class="hidden min-[1780px]:block fixed top-1/2 left-4 z-40 w-40 -translate-y-1/2"
      min-height="600px"
    />
    <GoogleAd
      placement="sidebar"
      format="vertical"
      container-class="hidden min-[1780px]:block fixed top-1/2 right-4 z-40 w-40 -translate-y-1/2"
      min-height="600px"
    />

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
import type { NotificationItem } from '#shared/types/models';

const { t, locale } = useI18n();
const { public: publicConfig } = useRuntimeConfig();

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: locale
  },
  script: publicConfig.adsense.clientId
    ? [
        {
          src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publicConfig.adsense.clientId}`,
          async: true,
          crossorigin: 'anonymous'
        }
      ]
    : []
});

useSeoMeta({
  title: `${t('app.name')} — Buy & sell locally`,
  description: t('app.description'),
  ogTitle: t('app.name'),
  twitterCard: 'summary_large_image'
});

const { loggedIn, user, clear } = useUserSession();
const router = useRouter();

const isStaff = computed(() => user.value?.userType === 'admin' || user.value?.userType === 'assistant');

const accountItems = computed(() => [
  [
    { label: t('nav.my_profile'), icon: 'i-lucide-user', to: '/account/profile' },
    { label: t('nav.my_listings'), icon: 'i-lucide-list', to: '/account/listings' },
    { label: t('nav.favorites'), icon: 'i-lucide-heart', to: '/account/favorites' },
    { label: t('nav.messages'), icon: 'i-lucide-message-circle', to: '/account/messages' },
    { label: t('nav.notifications'), icon: 'i-lucide-bell', to: '/account/notifications' },
    ...(isStaff.value
      ? [{ label: t('nav.admin'), icon: 'i-lucide-shield', to: '/admin' }]
      : [])
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

const toast = useToast();
const resendingVerification = ref(false);
async function resendVerification() {
  resendingVerification.value = true;
  try {
    await $fetch('/api/auth/resend-verification', { method: 'POST' });
    toast.add({ title: t('auth.verification_sent'), color: 'success' });
  } finally {
    resendingVerification.value = false;
  }
}

const unreadCount = ref(0);
const notificationsList = ref<NotificationItem[]>([]);
const notificationsOpen = ref(false);

async function refreshUnreadCount() {
  if (!loggedIn.value) return;
  const { count } = await $fetch('/api/notifications/unread-count').catch(() => ({ count: 0 }));
  unreadCount.value = count;
}

watch(notificationsOpen, async open => {
  if (open) {
    notificationsList.value = await $fetch<NotificationItem[]>('/api/notifications', {
      query: { limit: 10 }
    }).catch(() => []);
  }
});

async function markAllRead() {
  await $fetch('/api/notifications/read-all', { method: 'POST' });
  notificationsList.value = notificationsList.value.map(n => ({ ...n, readAt: new Date().toISOString() }));
  unreadCount.value = 0;
}

async function openNotification(notification: NotificationItem) {
  notificationsOpen.value = false;
  if (!notification.readAt) {
    await $fetch(`/api/notifications/${notification.id}/read`, { method: 'POST' });
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  }
  if (notification.link) router.push(notification.link);
}

if (loggedIn.value) refreshUnreadCount();
const { pause: pauseNotificationPoll } = useIntervalFn(refreshUnreadCount, 20000);
onUnmounted(() => pauseNotificationPoll());
</script>
