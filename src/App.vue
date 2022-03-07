<template>
  <div class="app">
    <h1>hello mini-vite</h1>
    <button @click="add">{{ count }}</button>
    <Foo />
  </div>
</template>

<script>
import { ref } from "vue";
import Foo from "./components/Foo.vue";
export default {
  components: {
    Foo,
  },
  setup() {
    const count = ref(0);

    function add() {
      count.value++;
    }
    return {
      count,
      add,
    };
  },
};
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}

h1 {
  color: pink;
}
</style>
