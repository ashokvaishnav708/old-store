// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vueuse/nuxt', 'nuxt-auth-utils', '@nuxtjs/i18n'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    s3: {
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET || 'listings',
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      publicUrl: process.env.S3_PUBLIC_URL
    },
    public: {
      appName: 'Old Store'
    }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    storage: {
      cache: {
        driver: 'redis',
        url: process.env.REDIS_URL
      }
    },
    // Nitro's dev server ignores `storage` and defaults route caching to the
    // filesystem unless `devStorage` is set too, so mirror it here.
    devStorage: {
      cache: {
        driver: 'redis',
        url: process.env.REDIS_URL
      }
    }
  },

  eslint: {
    config: {
      typescript: {
        strict: true,
        tsconfigPath: './'
      },
      stylistic: false
    }
  },

  i18n: {
    locales: [{ code: 'en', name: 'English', file: 'en.json' }],
    defaultLocale: 'en',
    // No additional locales yet, so no need for URL prefixes. Switch to
    // 'prefix_except_default' once a second language is added.
    strategy: 'no_prefix'
  }
});
