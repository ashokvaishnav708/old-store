<template>
  <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
    <UButton
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :label="item.label"
      :icon="item.icon"
      :color="route.path === item.to ? 'primary' : 'neutral'"
      :variant="route.path === item.to ? 'subtle' : 'ghost'"
      size="sm"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const { user } = useUserSession();

const items = computed(() => {
  const base = [
    { to: '/admin', label: t('admin.nav_dashboard'), icon: 'i-lucide-layout-dashboard' },
    { to: '/admin/listings', label: t('admin.nav_listings'), icon: 'i-lucide-package-search' },
    { to: '/admin/complaints', label: t('admin.nav_complaints'), icon: 'i-lucide-flag' },
    { to: '/admin/conversations', label: t('admin.nav_conversations'), icon: 'i-lucide-messages-square' },
    // Assistants can search users too, to adjust listing limits (ban/unban stays admin-only, gated in-page).
    { to: '/admin/users', label: t('admin.nav_users'), icon: 'i-lucide-user-search' }
  ];

  if (user.value?.userType === 'admin') {
    base.push({ to: '/admin/assistants', label: t('admin.nav_assistants'), icon: 'i-lucide-users' });
  }

  return base;
});
</script>
