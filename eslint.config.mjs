// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import prettier from 'eslint-config-prettier';

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      // <template> first, then <script>, then <style> if present.
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }]
    }
  },
  prettier
);
