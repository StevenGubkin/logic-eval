import { createApp } from 'vue';
import VueKatex from './vue-katex/src/plugin';
import 'katex/dist/katex.min.css';
// import router from './router';
import App from './App.vue';

const app = createApp(App);
app.use(VueKatex);
// app.use(router);
app.mount('#app');
