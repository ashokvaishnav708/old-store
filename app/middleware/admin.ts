export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession();

  if (!loggedIn.value) {
    return navigateTo('/login');
  }

  const userType = user.value?.userType;
  if (userType !== 'admin' && userType !== 'assistant') {
    return navigateTo('/');
  }
});
