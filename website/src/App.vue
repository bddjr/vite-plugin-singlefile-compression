<script setup lang="ts">
import 'highlight.js/styles/github-dark.min.css'
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/vite.svg" width="70" height="70" />

    <div class="wrapper">
      <HelloWorld />

      <nav>
        <RouterLink to="/">Setup</RouterLink>
        <RouterLink to="/options">Options</RouterLink>
        <RouterLink to="/clone">Clone</RouterLink>
        <RouterLink to="/license">License</RouterLink>
      </nav>
    </div>
  </header>

  <Suspense>
    <RouterView />
  </Suspense>
</template>

<style scoped>
.logo {
  display: block;
  margin: 0 auto 1rem;
}

nav {
  width: 100%;
  font-size: 18px;
  text-align: left;
  margin: 2rem 0 2rem -10px;
  padding: 8px 0;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  /* padding: 0 1rem; */
  padding: 0 10px;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    /* display: flex; */
    /* place-items: center; */
    /* padding-right: calc(var(--section-gap) / 2); */
  }

  .logo {
    /* margin: 0 2rem 0 0; */
    /* display: inline-block; */
  }

  header .wrapper {
    /* display: flex; */
    /* place-items: flex-start; */
    /* flex-wrap: wrap; */
    width: 1024px;
  }

  nav {
    margin-left: -1rem;
  }

  nav a {
    padding: 0 1rem;
  }
}
</style>
