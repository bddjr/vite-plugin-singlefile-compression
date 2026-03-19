<script setup lang="ts">
import Markdown from '@/components/Markdown.vue';
import mdText from '../md/setup.md?raw'
</script>

<template>
  <Markdown :md-text="mdText"></Markdown>
</template>
