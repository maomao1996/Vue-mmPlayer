<template>
  <div id="app">
    <!--主体-->
    <mm-header/>
    <router-view class="router-view"/>
    <!--更新说明-->
    <!-- <mm-dialog
      ref="versionDialog"
      type="alert"
      headText="更新提示"
      :bodyText="versionBody"
    />-->
    <!--播放器-->
    <audio ref="mmPlayer"></audio>
  </div>
</template>

<script>
window._CloudMusic = {
  props: null,
  setProps(props) {
    this.props = props
  },
  get state() {
    try {
      return window.parent.hass.states['cloudmusic.playlist']
    } catch (ex) {
      return "[]"
    }
  },
  get attr() {
    try {
      return window.parent.hass.states['cloudmusic.playlist'].attributes
    } catch (ex) {
      return null
    }
  },
  exec(args) {
    try {
      console.log(args.cmd)
      let hass = window.parent.hass
      hass.callService("cloudmusic", "exec", args);
    } catch (ex) {
      console.log(ex)
    }
  },
  action(cmd) {
    this.exec({ cmd: cmd })
  },
  play(index) {
    this.exec({ cmd: 'index', index: index })
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
        window._CloudMusic.exec({
          cmd: 'load',
          playlist: JSON.stringify(pl),
          index: currentIndex
        })
      }
    } catch (ex) {
      console.log(ex)
    }

  },
  update(hass) {
    //console.log('接收的值', hass)
    try {
      let props = window._CloudMusic.props
      if (props) {
        let attr = window._CloudMusic.state.attributes
        console.log(attr)
        let playList = JSON.parse(attr.playlist)
        if (playList.length > 0) {
          props.setCurrentIndex(attr.index)
        }
        props.setPlaying(attr.status == 'playing' || attr.status == 'play')
      }
    } catch (ex) {
      //console.error(ex)
    }
  }
}


import { mapMutations, mapActions } from 'vuex'
import { topList } from 'api'
import { defaultSheetId, VERSION } from '@/config'
import { createTopList } from 'assets/js/song'
import MmHeader from 'components/mm-header/mm-header'

import { getVersion, setVersion } from 'assets/js/storage'

const VERSIONBODY = `<div class="mm-dialog-text text-left">
版本号：${VERSION}（2019.04.04）<br/>
1、 优化滚动体验，缓存滚动位置<br>
2、 优化暂停 / 播放逻辑，减少重复请求<br>
3、 修复 IOS 下滚动卡顿的情况<br>
4、 修复 Safari、IOS 微信、安卓 UC不能播放问题
</div>`

export default {
  name: 'app',
  components: {
    MmHeader
  },
  created() {
    // 设置版本更新信息
    this.versionBody = VERSIONBODY

    // 获取正在播放列表
    // topList(defaultSheetId).then(res => {
    //   if (res.status === 200) {
    //     let list = this._formatSongs(res.data.playlist.tracks.slice(0, 100))
    //     this.setPlaylist({ list })
    //   }
    // })

    let attr = window._CloudMusic.attr
    if (attr) {
      console.log(attr)
      let list = JSON.parse(attr.playlist)
      if (list.length > 0) {
        this.setPlaylist({ list })
        this.setCurrentIndex(attr.index)
        this.setPlaying(attr.status == 'playing' || attr.status == 'play')
      }
    }

    // 设置title
    let OriginTitile = document.title
    let titleTime
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        document.title = '死鬼去哪里了！'
        clearTimeout(titleTime)
      } else {
        document.title = '(つェ⊂)咦!又好了!'
        titleTime = setTimeout(function () {
          document.title = OriginTitile
        }, 2000)
      }
    })

    // 设置audio元素
    this.$nextTick(() => {
      this.setAudioele(this.$refs.mmPlayer)
    })

    // 首次加载完成后移除动画
    const loadDOM = document.querySelector('#appLoading')
    if (loadDOM) {
      const animationendFunc = function () {
        loadDOM.removeEventListener('animationend', animationendFunc)
        loadDOM.removeEventListener('webkitAnimationEnd', animationendFunc)
        document.body.removeChild(loadDOM)
        // const version = getVersion()
        // if (version !== null) {
        //   setVersion(VERSION)
        //   if (version !== VERSION) {
        //     this.$refs.versionDialog.show()
        //   }
        // } else {
        //   setVersion(VERSION)
        //   this.$refs.versionDialog.show()
        // }
      }.bind(this)
      loadDOM.addEventListener('animationend', animationendFunc)
      loadDOM.addEventListener('webkitAnimationEnd', animationendFunc)
      loadDOM.classList.add('removeAnimate')
    }
  },
  methods: {
    // 歌曲数据处理
    _formatSongs(list) {
      let ret = []
      list.forEach(item => {
        const musicData = item
        if (musicData.id) {
          ret.push(createTopList(musicData))
        }
      })
      return ret
    },
    ...mapMutations({
      setAudioele: 'SET_AUDIOELE',
      setCurrentIndex: 'SET_CURRENTINDEX',
      setPlaying: 'SET_PLAYING'
    }),
    ...mapActions(['setPlaylist'])
  }
}
</script>

<style lang="less">
#app {
  position: relative;
  width: 100%;
  height: 100%;
  color: @text_color;
  font-size: @font_size_medium;

  .router-view {
    width: 100%;
    height: 100%;
  }

  audio {
    position: fixed;
  }
}
</style>
