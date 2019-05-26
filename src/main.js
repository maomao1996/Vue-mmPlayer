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

// 版权信息
window.mmPlayer = window.mmplayer = `欢迎使用 mmPlayer!
当前版本为：V${VERSION}
作者：茂茂
Github：https://github.com/maomao1996/Vue-mmPlayer
歌曲来源于网易云音乐 (http://music.163.com)`
console.info(`%c${window.mmplayer}`, `color:blue`)


// 网易云音乐插件
window.cloudMusic = {
  ready() {
    let attr = this.attr
    if (attr) {
      let list = attr.playlist
      if (list.length > 0) {
        store.dispatch('setPlaylist', { list })
        store.commit('SET_CURRENTINDEX', attr.index)
        store.commit('SET_PLAYING', attr.isPlaying)
      }
    }
  },
  get hass() {
    return window.parent.hass || {}
  },
  get attr() {
    try {
      let attributes = this.hass.states['media_player.clv'].attributes
      if (typeof attributes.media_playlist === 'string') {
        attributes.playlist = JSON.parse(attributes.media_playlist)
      } else {
        attributes.playlist = attributes.media_playlist || []
      }
      attributes['index'] = attributes.playlist.findIndex((ele, index) =>
        attributes.source == ((index + 1) + '.' + ele.song + ' - ' + ele.singer))
      attributes['isPlaying'] = this.hass.states['media_player.clv'].state == 'playing'
      return attributes
    } catch (ex) {
      //console.log(ex)
      return null
    }
  },
  exec(args) {
    try {
      let media_args = {
        entity_id: "media_player.clv"
      }
      let media_action = 'play_media'
      //console.log(args.cmd)
      if (args.cmd == 'prev') {
        media_action = 'media_previous_track'
      } else if (args.cmd == 'next') {
        media_action = 'media_next_track'
      } else if (args.cmd == 'index') {
        media_args['media_content_id'] = args.index
        media_args['media_content_type'] = 'music_load'
      } else if (args.cmd == 'play') {
        media_action = 'media_play'
      } else if (args.cmd == 'pause') {
        media_action = 'media_pause'
      } else if (args.cmd == 'load') {
        media_args['media_content_id'] = JSON.stringify({
          index: args.index,
          list: args.playlist
        })
        media_args['media_content_type'] = 'music_playlist'
      } else if (args.cmd == 'volume') {
        media_action = 'volume_set'
        media_args['volume_level'] = parseFloat(args.index)
      }
      this.hass.callService("media_player", media_action, media_args);
    } catch (ex) {
      console.log(ex)
    }
  },
  //状态更新
  update() {    
    try {
      if (this.attr) {
        if (this.attr.playlist.length > 0) {
          store.commit('SET_CURRENTINDEX', this.attr.index)
        }
        store.commit('SET_PLAYING', this.attr.isPlaying)
      }
    } catch (ex) {
      //console.error(ex)
    }
  },
  //设置音量
  timer: null,
  setVolume(volume) {
    if (this.hass) {
      if (this.timer != null) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.exec({
          cmd: 'volume',
          index: volume.toFixed(1)
        })
      }, 1000)
    }
  },
  loadlist(playList, currentIndex) {
    if (this.hass) {
      try {
        let pl = []
        playList.forEach((ele, index) => {
          pl.push({
            song: ele.name,
            singer: ele.singer,
            ...ele
          })
        })
        if (pl.length > 0) {
          this.exec({
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
}

window.cloudMusic.ready()


/* eslint-disable no-new */
new Vue({
  el: '#mmPlayer',
  store,
  router,
  render: h => h(App)
})
