<script>
import { ref } from "vue";
import Foo from "./Foo.vue";
import Bar from './Bar.vue'
export default {
  components: {
    Foo,
    Bar
  },
  setup() {
    const count = ref(12);
    const add = () => {
      count.value++;
    };
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
  <Bar />
</template>

<style scoped>
h1 {
  color: red;
}
</style>
