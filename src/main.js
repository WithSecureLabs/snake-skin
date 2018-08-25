import Buefy from 'buefy';
import VTooltip from 'v-tooltip';
import Vue from 'vue';
import VueResource from 'vue-resource';

import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

Vue.use(Buefy);
Vue.use(VTooltip);
Vue.use(VueResource);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
