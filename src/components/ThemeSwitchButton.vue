<script setup lang="ts">
import { Prototype } from '@inkline/inkline';
import { inject, ref } from 'vue';

const inkline = inject<Prototype>('inkline', {} as any);
const colorMode = ref(inkline.options.colorMode);

// Set the initial color mode value to determine the icon to be displayed
if (colorMode.value === 'system' && typeof window !== 'undefined') {
  colorMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Toggle between light and dark mode
const setColorMode = () => {
  const mode = colorMode.value === 'dark' ? 'light' : 'dark';

  inkline.options.colorMode = mode;
  colorMode.value = mode;
};
</script>

<template>
  <i-button @click="setColorMode" class="color-switch">
    <icon-mdi-white-balance-sunny v-if="colorMode === 'dark'" />
    <icon-mdi-moon-waning-crescent v-else />
    <span class="_visually-hidden">
      <span>Toggle color mode</span>
    </span>
  </i-button>
</template>

<style lang="scss">
.color-switch {
  position: fixed;
  right: 1rem;
  top: 1rem;
  cursor: pointer;
}
</style>
