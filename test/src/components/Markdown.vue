<script setup lang="ts">

const props = defineProps<{
    mdText: string
}>()

import markdownit from 'markdown-it'
import highlightjs from 'markdown-it-highlightjs';
import 'highlight.js/styles/github-dark.min.css'

import { ref } from 'vue';

const mdHtml = ref('')

const md = markdownit({
    breaks: true,
    linkify: true,
})

md.use(highlightjs, {
    auto: false,
})

mdHtml.value = md.render(props.mdText).replaceAll('<a ', '<a target=_blank ')

</script>

<template>
    <div class="md" v-html="mdHtml"></div>
</template>

<style>
p,
h1 {
    margin: 16px 0;
}
</style>