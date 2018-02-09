// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import store from './store'
import router from './router'
import App from './App'

//网络请求
import axios from 'axios'
Vue.prototype.$http = axios;

import mmToast from 'base/mm-toast/index.js'
Vue.use(mmToast);

//引入样式
import '@/assets/css/index.less'

const isDebug_mode = process.env.NODE_ENV !== 'production';
Vue.config.silent = isDebug_mode;
Vue.config.debug = isDebug_mode;
Vue.config.devtools = isDebug_mode;
Vue.config.productionTip = isDebug_mode;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    router,
    components: {App},
    template: '<App/>'
})
