<template>
  <div id="app">
    <!--主体-->
    <mm-header />
    <router-view />
    <!--更新说明-->
    <mm-dialog ref="versionDialog" type="alert" head-text="通知" :body-text="versionInfo" />
    <!--播放器-->
    <audio ref="mmPlayer"></audio>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import { getPlaylistDetail } from 'api'
import { MMPLAYER_CONFIG, VERSION } from '@/config'
import MmHeader from 'components/mm-header/mm-header'
import MmDialog from 'base/mm-dialog/mm-dialog'
import { getVersion, setVersion } from '@/utils/storage'

const VERSION_INFO = `<div class="mm-dialog-text text-left">
版本号：${VERSION}（${process.env.VUE_APP_UPDATE_TIME}）<br/>
这个网页大部分访问来源都是我学校那些机房的IP<br>
So <br>
也不知道是哪个老六给我宣传了，简直捧杀（😒 你出来，保证不打你）
</div>`

export default {
  name: 'App',
  components: {
    MmHeader,
    MmDialog
  },
  created() {
    // 设置版本更新信息
    this.versionInfo = VERSION_INFO

    // 获取正在播放列表
    getPlaylistDetail(MMPLAYER_CONFIG.PLAYLIST_ID).then((playlist) => {
      const list = playlist.tracks.slice(0, 100)
      this.setPlaylist({ list })
    })

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
    let loadDOM = document.querySelector('#appLoading')
    if (loadDOM) {
      const animationendFunc = function () {
        loadDOM.removeEventListener('animationend', animationendFunc)
        loadDOM.removeEventListener('webkitAnimationEnd', animationendFunc)
        document.body.removeChild(loadDOM)
        loadDOM = null
        const version = getVersion()
        if (version !== null) {
          setVersion(VERSION)
          if (version !== VERSION) {
            this.$refs.versionDialog.show()
          }
        } else {
          setVersion(VERSION)
          this.$refs.versionDialog.show()
        }
      }.bind(this)
      loadDOM.addEventListener('animationend', animationendFunc)
      loadDOM.addEventListener('webkitAnimationEnd', animationendFunc)
      loadDOM.classList.add('removeAnimate')
    }
  },
  methods: {
    ...mapMutations({
      setAudioele: 'SET_AUDIOELE'
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

  audio {
    position: fixed;
  }
}
</style>
