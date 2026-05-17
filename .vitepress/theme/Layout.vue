<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import GiscusComment from './components/GiscusComment.vue'
</script>

<template>
  <DefaultTheme>
    <template #doc-footer-before>
      <GiscusComment />
    </template>
  </DefaultTheme>
</template>
