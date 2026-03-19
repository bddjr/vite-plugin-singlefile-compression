<script setup lang="ts">
import Markdown from '@/components/Markdown.vue';
import mdText from '../md/description.md?raw'
</script>

<template>
  <div class="greetings">
    <h1 class="green">vite plugin singlefile compression</h1>
    <Markdown :md-text="mdText" class="md"></Markdown>
  </div>
</template>

<style scoped>
.md p {
  margin: 6px 0;
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {

  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
