<script setup>
import { ref } from "vue";
const count = ref(110);

function add() {
  count.value++;
}
</script>

<template>
  <h1>hello vite {{ count }}</h1>
  <button @click="add">+</button>
  <!-- <Foo />
  <Bar /> -->
</template>

<style scoped>
h1 {
  color: red;
}
</style>
