<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      <p>
        Compress all assets and embeds them into <code>dist/index.html</code>, making it convenient to share as a single
        HTML file.
      </p>
      <p>
        The recipient can open it directly in the browser without manually unzipping the file.
      </p>
      <p>
        Using <a target="_blank"
          href="https://developer.mozilla.org/docs/Web/API/DecompressionStream">DecompressionStream</a> +
        <a target="_blank" href="https://www.npmjs.com/package/base128-ascii">base128-ascii</a>.
      </p>
      <p>
        Github: <a target="_blank"
          href="https://github.com/bddjr/vite-plugin-singlefile-compression">https://github.com/bddjr/vite-plugin-singlefile-compression</a>
      </p>
    </h3>
  </div>
</template>

<style scoped>
p {
  margin: 10px 0;
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
