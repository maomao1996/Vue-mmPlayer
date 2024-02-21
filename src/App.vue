<template>
  <div id="app">
    <!--主体-->
    <mm-header />
    <router-view />
    <!--更新说明-->
    <mm-dialog ref="versionDialog" type="alert" head-text="更新提示" :body-text="versionInfo" />
    <!--播放器 没有controls属性就不会在页面中显示出来-->
    <audio ref="mmPlayer"></audio>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import {getPlaylistDetailNetease, getPlaylistDetailNeteaseSpider} from 'api/index'
import { MMPLAYER_CONFIG, VERSION } from '@/config'
import MmHeader from 'components/mm-header/mm-header'
import MmDialog from 'base/mm-dialog/mm-dialog'
import { getVersion, setVersion } from '@/utils/storage'

const VERSION_INFO = `<div class="mm-dialog-text text-left">
版本号：${VERSION}（${process.env.VUE_APP_UPDATE_TIME}）<br/>
1、 采用新版图标<br>
2、 修复音乐搜索<br>
3、 优化滚动条样式
</div>`

export default {
  name: 'App',
  data() {
    return {
      versionInfo: ''
    }
  },
  components: {
    MmHeader,
    MmDialog,
  },
  created() {
    // 设置版本更新信息
    this.versionInfo = VERSION_INFO

    // 获取正在播放列表,初次获取某个特定歌单
    getPlaylistDetailNetease(MMPLAYER_CONFIG.PLAYLIST_ID).then((playlist) => {
      // 只取前100首
      const list = playlist.tracks.slice(0, 100)
      this.setPlaylist({ list })
    })

    // 设置title -- 当该窗口被切换掉时显示特定标题
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
      // //console.log('audio: ')
      //console.dir(this.$refs.mmPlayer)
      this.setAudioele(this.$refs.mmPlayer)
    })

    // 首次加载完成后移除动画
    /*
    if内逻辑是:
    1. 定义回调函数,将回调函数添加给动画结束事件
      - 因为是回调函数,所以this的指向是appLoading标签.又因为要用到当前VC实例,所以bing修改.这里改用箭头函数后this是window,不可行
    2. 动画结束后触发回调函数,先移除事件绑定,再判断是否要弹框提示版本更新
     */
    let loadDOM = document.querySelector('#appLoading')
    if (loadDOM) {
      const animationendFunc = function () {
        loadDOM.removeEventListener('animationend', animationendFunc)
        loadDOM.removeEventListener('webkitAnimationEnd', animationendFunc)
        document.body.removeChild(loadDOM)
        loadDOM = null
        //为了测试dialog的效果,强行提示
        // this.$refs.versionDialog.show()
        //在localStorage中找之前存的version,每次打开网站进行比较,如果不相同.就说明打开的是新版本,则进行提示
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
  // 涉及到vuex知识点
  methods: {
    ...mapMutations({
      setAudioele: 'SET_AUDIOELE',
    }),
    ...mapActions(['setPlaylist']),
  },
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
