<template>
  <div id="app">
    <!--主体-->
    <mm-header />
    <router-view />
    <!--播放器-->
    <audio ref="mmPlayer" preload="auto"></audio>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import { getRandomPlaylistDetail } from 'api'
import MmHeader from 'components/mm-header/mm-header'
export default {
  name: 'App',
  components: {
    MmHeader
  },
  created() {
    // 设置版本更新信息
    // this.versionInfo = VERSION_INFO

    // 获取正在播放列表
    // getPlaylistDetail(MMPLAYER_CONFIG.PLAYLIST_ID).then((playlist) => {
    //   const list = playlist.tracks.slice(0, 100)
    //   this.setPlaylist({ list })
    // })

    getRandomPlaylistDetail()
      .then(({ data }) => {
        console.log(data)
        if (data.success) {
          const list = data.data.songs
          this.setPlaylist({ list })
        }
      })
      .catch((err) => {
        console.log(err)
      })
    // 设置audio元素
    this.$nextTick(() => {
      this.setAudioele(this.$refs.mmPlayer)
    })

    // // 首次加载完成后移除动画
    // let loadDOM = document.querySelector('#appLoading')
    // if (loadDOM) {
    //   const animationendFunc = function () {
    //     loadDOM.removeEventListener('animationend', animationendFunc)
    //     loadDOM.removeEventListener('webkitAnimationEnd', animationendFunc)
    //     document.body.removeChild(loadDOM)
    //     loadDOM = null
    //     // const version = getVersion()
    //     // if (version !== null) {
    //     //   setVersion(VERSION)
    //     //   if (version !== VERSION) {
    //     //     this.$refs.versionDialog.show()
    //     //   }
    //     // } else {
    //     //   setVersion(VERSION)
    //     //   this.$refs.versionDialog.show()
    //     // }
    //   }.bind(this)
    //   loadDOM.addEventListener('animationend', animationendFunc)
    //   loadDOM.addEventListener('webkitAnimationEnd', animationendFunc)
    //   loadDOM.classList.add('removeAnimate')
    // }
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
