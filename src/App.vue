<script>
import { ref } from "vue";
import Foo from "./components/Foo.vue";
export default {
  components: {
    Foo,
  },
  setup() {
    const count = ref(110);

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

<template>
  <h1>hello vite {{ count }}</h1>
  <button @click="add">+</button>
  <Foo />
  <!-- <Bar /> -->
</template>

<style scoped>
h1 {
  color: red;
}
</style>
