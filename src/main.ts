import { createApp } from "vue";
import "./styles/style.scss";
import "bootstrap";
import App from "./App.vue";
import { createPinia } from "pinia";
import i18n from './i18n/i18n'; // Korrekte Pfadangabe
import router from "./router/router";


const pinia = createPinia();


const app = createApp(App);

app.use(pinia);
app.use(i18n);
app.use(router);
app.mount("#app");
