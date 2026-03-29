<script setup lang="ts">
import MD from '@/md-vue/description.vue'
</script>

<template>
  <div class="greetings">
    <h1 class="purple">vite plugin singlefile compression</h1>
    <MD />
  </div>
</template>

<style scoped>
h1 {
  /* font-weight: 500; */
  font-weight: normal;
  font-size: 34px;
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
  h1 {
    /* font-size: 2.6rem; */
  }

  .greetings h1 {
    margin-top: 0;
  }

  .greetings h1,
  .greetings h3 {
    /* margin: 0; */
    padding: 0;
    /* text-align: left; */
  }
}
</style>
