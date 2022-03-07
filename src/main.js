import { createApp } from "vue";
import "./asset/css/global.css";
import App from "./App.vue";
import { debounce } from "lodash-es";
// console.log(debounce);
// debounce();

createApp(App).mount("#app");
