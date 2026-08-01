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
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || '1025',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || 'noreply@oldstore.local'
    },
    public: {
      appName: 'Old Store',
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      adsense: {
        // Google AdSense publisher ID (ca-pub-XXXXXXXXXXXXXXXX). Ad units are
        // disabled entirely when this is unset, e.g. in local dev.
        clientId: process.env.NUXT_PUBLIC_ADSENSE_CLIENT_ID || '',
        // Ad unit slot IDs, created per-placement in the AdSense dashboard.
        slotSidebar: process.env.NUXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || '',
        slotInFeed: process.env.NUXT_PUBLIC_ADSENSE_SLOT_IN_FEED || '',
        slotInContent: process.env.NUXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT || ''
      }
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
    },
    experimental: {
      tasks: true
    },
    // Runs in-process (no external cron needed) for the node-server preset
    // this app deploys as. See server/tasks/listings/expire.ts.
    scheduledTasks: {
      '*/15 * * * *': ['listings:expire']
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
