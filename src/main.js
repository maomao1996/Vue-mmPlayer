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
//console.info(`%c${window.mmplayer}`, `color:blue`)


// 网易云音乐插件
window.clv = {
  get hass() {
    return new Promise(async (resolve, reject) => {
      let res = await top.window.hassConnection
      if (res == null) {
        reject("请在Home Assistant中使用")
        return
      }
      let conn = res.conn
      let musicEntity = Object.keys(conn._ent.state).find(key => key.indexOf('media_player.cloud_music_') === 0)
      console.log(musicEntity)
      let _clv = conn._ent.state[musicEntity]
      let o = Object.create(null)
      let attr = _clv.attributes
      if (typeof attr.media_playlist === 'string') {
        attr.playlist = JSON.parse(attr.media_playlist)
      } else {
        attr.playlist = attr.media_playlist || []
      }
      attr['index'] = attr.playlist.findIndex((ele, index) =>
        attr.source == ((index + 1) + '.' + ele.song + ' - ' + ele.singer))
      o.attr = attr
      o.id = musicEntity
      o.isReady = ['playing', 'paused'].includes(_clv.state)
      o.isPlaying = _clv.state == 'playing'
      o.state = _clv.state
      o.call = (service_data, service = 'play_media', domain = 'media_player') => {
        conn.socket.send(JSON.stringify({
          id: Date.now(),
          type: "call_service",
          domain,
          service,
          service_data
        }))
      }
      resolve(o)
    })
  },
  ready() {
    this.hass.then(({ attr, isPlaying }) => {
      let list = attr.playlist
      if (list.length > 0) {
        store.dispatch('setPlaylist', { list })
        store.commit('SET_CURRENTINDEX', attr.index)
        store.commit('SET_PLAYING', isPlaying)
      }
    })
  },
  exec(args) {
    this.hass.then(({ call, id }) => {
      let media_args = {
        entity_id: id
      }
      let media_action = 'play_media'
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
      call(media_args, media_action, "media_player");
    })
  },
  //设置音量
  timer: null,
  setVolume(volume) {

    if (this.timer != null) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      this.exec({
        cmd: 'volume',
        index: volume.toFixed(1)
      })
    }, 1000)

  },
  loadlist(playList, currentIndex) {


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

  }
}

window.clv.ready()


/* eslint-disable no-new */
new Vue({
  el: '#mmPlayer',
  store,
  router,
  render: h => h(App)
})
