// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import 'babel-polyfill'
// import '@/utils/hack'
import Vue from 'vue'
import store from './store'
import router from './router'
import App from './App'
import fastclick from 'fastclick'
import mmToast from 'base/mm-toast'
import Icon from 'base/mm-icon/mm-icon'
import VueLazyload from 'vue-lazyload'
import { VERSION } from './config'

import '@/styles/index.less'

// 优化移动端300ms点击延迟
fastclick.attach(document.body)

// 弹出层
Vue.use(mmToast)

// icon 组件
Vue.component(Icon.name, Icon)

// 懒加载
Vue.use(VueLazyload, {
  preLoad: 1,
  loading: require('assets/img/default.png'),
  // error: require('assets/img/default.png'),
})

// 访问版本统计
window._hmt && window._hmt.push(['_setCustomVar', 1, 'version', VERSION, 1])

const redirectList = ['/music/details', '/music/comment']
router.beforeEach((to, from, next) => {
  window._hmt && to.path && window._hmt.push(['_trackPageview', '/#' + to.fullPath])
  if (redirectList.includes(to.path)) {
    next()
  } else {
    document.title =
      (to.meta.title && `${to.meta.title} - mmPlayer在线音乐播放器`) || 'mmPlayer在线音乐播放器'
    next()
  }
})

// 页面标题滚动
/*const scroll = function () {
  var originalTitle = document.title;
  var scrollText = " | " + originalTitle;
  var scrollPos = 0;
  var scrollSpeed = 50; // 滚动速度，单位为毫秒
  var scrollDelay = 2000; // 滚动延迟，单位为毫秒

  function scrollTitle() {
    document.title = scrollText.substring(scrollPos, scrollText.length) + scrollText.substring(0, scrollPos);
    scrollPos++;
    if (scrollPos >= scrollText.length) {
      scrollPos = 0;
      setTimeout(scrollTitle, scrollDelay);
    } else {
      setTimeout(scrollTitle, scrollSpeed);
    }
  }

  console.log('scroll~~~')
  scrollTitle();
}
scroll()*/

// 版权信息
window.mmPlayer = window.mmplayer = `欢迎使用 mmPlayer!
当前版本为：V${VERSION}
作者：茂茂
Github：https://github.com/maomao1996/Vue-mmPlayer
歌曲来源于网易云音乐 (https://music.163.com)`

// eslint-disable-next-line no-console
console.info(`%c${window.mmplayer}`, `color:blue`)

// eslint-disable-next-line no-new
const vm = new Vue({
  el: '#mmPlayer',
  store,
  router,
  render: (h) => h(App),
})

window.mm = vm
