// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import 'babel-polyfill'
// import 'assets/js/hack'
import Vue from 'vue'
import store from './store'
import router from './router'
import App from './App'
import fastclick from 'fastclick'
import mmToast from 'base/mm-toast'
import VueLazyload from 'vue-lazyload'
import { VERSION } from './config'

import '@/assets/css/index.less'

// 优化移动端300ms点击延迟
fastclick.attach(document.body)

// 弹出层
Vue.use(mmToast)

// 懒加载
Vue.use(VueLazyload, {
  preLoad: 1,
  loading: require('assets/img/default.png')
})

const redirectList = ['/music/details', '/music/comment']
router.beforeEach((to, from, next) => {
  window._hmt &&
    to.path &&
    window._hmt.push(['_trackPageview', '/#' + to.fullPath])
  if (redirectList.includes(to.path)) {
    next()
  } else {
    document.title =
      (to.meta.title && `${to.meta.title} - mmPlayer在线音乐播放器`) ||
      'mmPlayer在线音乐播放器'
    next()
  }
})

// 版权信息
window.mmPlayer = window.mmplayer = `欢迎使用 mmPlayer!
当前版本为：V${VERSION}
作者：茂茂
Github：https://github.com/maomao1996/Vue-mmPlayer
歌曲来源于网易云音乐 (http://music.163.com)`
console.info(`%c${window.mmplayer}`, `color:blue`)






// 网易云音乐插件
window.cloudMusic = window._CloudMusic = {
  ready() {
    let attr = this.attr
    if (attr) {
      let list = JSON.parse(attr.playlist)
      if (list.length > 0) {
        store.dispatch('setPlaylist', { list })
        store.commit('SET_CURRENTINDEX', attr.index)
        store.commit('SET_PLAYING', this.status.isPlaying)
      }
    }
  },
  get hass() {
    return window.parent.hass
  },
  get attr() {
    try {
      return this.hass.states['cloudmusic.playlist'].attributes
    } catch (ex) {
      return null
    }
  },
  get status() {
    let isPlaying = false
    if (this.attr) {
      isPlaying = this.attr.status == 'playing' || this.attr.status == 'play'
    }
    return {
      isPlaying
    }
  },
  exec(args) {
    try {
      //console.log(args.cmd)
      this.hass.callService("cloudmusic", "exec", args);
    } catch (ex) {
      console.log(ex)
    }
  },
  //状态更新
  update(hass) {
    //console.log('接收的值', hass)
    try {
      let props = window._CloudMusic.props
      if (props) {
        let attr = window._CloudMusic.state.attributes
        console.log(attr)
        let playList = JSON.parse(attr.playlist)
        if (playList.length > 0) {
          store.commit('SET_CURRENTINDEX', attr.index)
        }
        props.setPlaying(attr.status == 'playing' || attr.status == 'play')
      }
    } catch (ex) {
      //console.error(ex)
    }
  },
  //设置音量
  timer: null,
  setVolume(volume) {
    if (this.timer != null) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      if (this.hass) {
        this.hass.callService("media_player", "volume_set", {
          entity_id: "media_player.vlc",
          volume_level: volume.toFixed(1)
        });
      }
      console.log(volume.toFixed(1))
    }, 1000)
  },
  loadlist(playList, currentIndex) {
    try {
      let pl = []
      playList.forEach(ele => {
        pl.push({
          song: ele.name,
          singer: ele.singer,
          ...ele
        })
      })
      if (pl.length > 0) {
        window.cloudMusic.exec({
          cmd: 'load',
          playlist: JSON.stringify(pl),
          index: currentIndex
        })
      }
    } catch (ex) {
      console.log(ex)
    }

  }
}

window.cloudMusic.ready()









/* eslint-disable no-new */
new Vue({
  el: '#mmPlayer',
  store,
  router,
  render: h => h(App)
})
