<template>
  <div class="music flex-col">
    <div class="music-content">
      <div class="music-left flex-col">
        <music-btn @onClickLyric="handleOpenLyric" />
        <keep-alive :include="['PlayList', 'UserList', 'TopList', 'Search', 'HistoryList', 'BiliSearch']">
          <router-view class="router-view" />
        </keep-alive>
      </div>
      <!--这个歌词div默认在router-view一侧. 当show类被添加后,会覆盖整个屏幕, 但router-view并不受影响-->
      <div class="music-right"  :class="{ show: lyricVisible }">
        <div class="close-lyric" @click="handleCloseLyric">关闭歌词</div>
        <lyric ref="lyric" :lyric="lyric" :nolyric="nolyric" :lyric-index="lyricIndex" />
      </div>
    </div>

    <!-- 播放器 -->
<!--    @TODO 监测歌曲播放时是否被跳过, 如果跳过说明不匹配用户-->
    <div class="music-bar" :class="{ disable: !musicReady || !currentMusic.id }">
      <div class="music-bar-btns">
        <mm-icon class="pointer" type="prev" :size="36" title="上一曲 Ctrl + Left" @click="prev" />
        <div class="control-play pointer" title="播放暂停 Ctrl + Space" @click="play">
          <mm-icon :type="playing ? 'pause' : 'play'" :size="24" />
        </div>
        <mm-icon class="pointer" type="next" :size="36" title="下一曲 Ctrl + Right" @click="next" />
      </div>
      <div class="music-music">
        <div class="music-bar-info">
          <template v-if="currentMusic && currentMusic.id">
            {{ currentMusic.name }}
            <span>- {{ currentMusic.singer }}</span>
          </template>
          <template v-else>欢迎使用mmPlayer在线音乐播放器</template>
        </div>
        <div v-if="currentMusic.id" class="music-bar-time">
          {{ currentTime | format }}/{{ currentMusic.duration % 3600 | format }}
        </div>
        <mm-progress
          class="music-progress"
          :percent="percentMusic"
          :percent-progress="currentProgress"
          @percentChange="progressMusic"
          @percentChangeEnd="progressMusicEnd"
        />
      </div>

      <!-- 播放模式 -->
      <mm-icon
        class="icon-color pointer mode"
        :type="getModeIconType()"
        :title="getModeIconTitle()"
        :size="30"
        @click="modeChange"
      />

      <!-- 评论 -->
      <mm-icon class="icon-color pointer comment" type="comment" :size="30" @click="openComment" />

      <!-- 音量控制 -->
      <div class="music-bar-volume" title="音量加减 [Ctrl + Up / Down]">
        <volume :volume="volume" @volumeChange="volumeChange" />
      </div>
    </div>

    <!--遮罩-->
<!--    如果是b站视频,图片请求不能携带referer. 而这里背景图片请求无法修改referer. 暂时不解决它, 未来直接从QQ音乐平台获取正版封面-->
    <div class="mmPlayer-bg" :style="{ backgroundImage: picUrl }"></div>
    <div class="mmPlayer-mask"></div>
  </div>
</template>

<script>
import { getLyric } from 'api'
import mmPlayerMusic from './mmPlayer'
import { randomSortArray, parseLyric, format, silencePromise } from '@/utils/util'
import { PLAY_MODE, MMPLAYER_CONFIG } from '@/config'
import { getVolume, setVolume } from '@/utils/storage'
import { mapGetters, mapMutations, mapActions } from 'vuex'

import MmProgress from 'base/mm-progress/mm-progress'
import MusicBtn from 'components/music-btn/music-btn'
import Lyric from 'components/lyric/lyric'
import Volume from 'components/volume/volume'
import {audioEle} from "@/store/getters";

export default {
  name: 'Music',
  components: {
    MmProgress,
    MusicBtn,
    Lyric,
    Volume,
  },
  filters: {
    // 时间格式化
    format,
  },
  data() {
    const volume = getVolume()
    return {
      musicReady: false, // 是否可以使用播放器
      currentTime: 0, // 当前播放时间
      currentProgress: 0, // 当前缓冲进度
      lyricVisible: false, // 控制歌词div的类show,当为true时,div会调整到指定样式覆盖整个屏幕
      lyric: [], // 歌词
      nolyric: false, // 是否有歌词
      lyricIndex: 0, // 当前播放歌词下标
      isMute: false, // 是否静音
      volume, // 音量大小,
    }
  },
  computed: {
    picUrl() {
      const idTest = this.currentMusic.id + ''
      if (idTest.startsWith('BV')) {
        /*console.log('background picUrl=', `${this.currentMusic.image}@672w_378h_1c_!web-search-common-cover.avif`)
        return `${this.currentMusic.image}@672w_378h_1c_!web-search-common-cover.avif`*/
        return `url(${MMPLAYER_CONFIG.BACKGROUND})`
      }

      return this.currentMusic.id && this.currentMusic.image
        ? `url(${this.currentMusic.image}?param=300y300)`
        : `url(${MMPLAYER_CONFIG.BACKGROUND})`
    },
    percentMusic() {
      const duration = this.currentMusic.duration
      return this.currentTime && duration ? this.currentTime / duration : 0
    },
    ...mapGetters([
      'commentOpen',
      'audioEle',
      'mode',
      'playing',
      'playlist',
      'orderList',
      'currentIndex',
      'currentMusic',
      'historyList',
    ]),
  },
  watch: {
    // 这里监测vuex中的currentMusic对象, prev/next/play()等函数改动的是currentIndex.
    //而getters.js中state.playlist[state.currentIndex], 所以改动currentIndex会影响currentMusic
    currentMusic(newMusic, oldMusic) {
      console.log('music.vue#watch currentMusic')
      if (!newMusic.id) {
        this.lyric = []
        return
      }
      if (newMusic.id === oldMusic.id) {
        console.log('新旧musicId相同')
        return
      }

      if (newMusic.canUrls.length === 0) {
        //第一次播放, 没有尝试过任何url
        this.audioEle.src = newMusic.urls[0]
      } else {
        //已经过滤过urls, 直接使用canUrls中的url
        //@TODO 由于一旦筛选出可以播放的url就不会再请求新的url,所以可能导致新出的优质音频无法获取. 未来提供一个按钮,删除缓存的canUrls,重新获取url
        this.audioEle.src = newMusic.canUrls[0]
        console.dir(this.audioEle)
      }

      // 重置相关参数
      this.lyricIndex = this.currentTime = this.currentProgress = 0
      silencePromise(this.audioEle.play())
      this.$nextTick(() => {
        this._getLyric(newMusic.id)
      })
    },
    // 点击播放/暂停按钮后, 修改playing的值
    playing(newPlaying) {
      const audio = this.audioEle
      this.$nextTick(() => {
        newPlaying ? silencePromise(audio.play()) : audio.pause()
        this.musicReady = true
      })
    },
    //监测currentTime为了修改lyricIndex
    currentTime(newTime) {
      if (this.nolyric) {
        return
      }
      let lyricIndex = 0
      for (let i = 0; i < this.lyric.length; i++) {
        if (newTime > this.lyric[i].time) {
          lyricIndex = i
        }
      }
      this.lyricIndex = lyricIndex
    },
    // 监听浏览器地址栏路径的变化
    //当路径变化时,可能是因为用户点击了回退. 此时就要关闭全屏歌词
    $route() {
      this.lyricVisible = false
    },
  },
  mounted() {
    this.$nextTick(() => {
      mmPlayerMusic.initAudio(this)
      this.initKeyDown()
      // 初始化的音量调整
      this.volumeChange(this.volume)
    })
  },
  methods: {
    // 按键事件
    initKeyDown() {
      document.onkeydown = (e) => {
        switch (e.ctrlKey && e.keyCode) {
          case 32: // 播放暂停Ctrl + Space
            this.play()
            break
          case 37: // 上一曲Ctrl + Left
            this.prev()
            break
          case 38: // 音量加Ctrl + Up
            let plus = Number((this.volume += 0.1).toFixed(1))
            if (plus > 1) {
              plus = 1
            }
            this.volumeChange(plus)
            break
          case 39: // 下一曲Ctrl + Right
            this.next()
            break
          case 40: // 音量减Ctrl + Down
            let reduce = Number((this.volume -= 0.1).toFixed(1))
            if (reduce < 0) {
              reduce = 0
            }
            this.volumeChange(reduce)
            break
          case 79: // 切换播放模式Ctrl + O
            this.modeChange()
            break
        }
      }
    },
    // 上一曲
    prev() {
      if (!this.musicReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index < 0) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing && this.musicReady) {
          this.setPlaying(true)
        }
        this.musicReady = false
      }
    },
    // 播放暂停
    play() {
      if (!this.musicReady) {
        return
      }
      this.setPlaying(!this.playing)
    },
    // 下一曲
    // 当 flag 为 true 时，表示上一曲播放失败
    next(flag = false) {
      if (!this.musicReady) {
        return
      }
      const {
        playlist: { length },
      } = this
      if (
        (length - 1 === this.currentIndex && this.mode === PLAY_MODE.ORDER) ||
        (length === 1 && flag)
      ) {
        this.setCurrentIndex(-1)
        this.setPlaying(false)
        return
      }
      if (length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex + 1
        if (index === length) {
          index = 0
        }
        if (!this.playing && this.musicReady) {
          this.setPlaying(true)
        }
        this.setCurrentIndex(index)
        this.musicReady = false
      }
    },
    // 循环
    loop() {
      this.audioEle.currentTime = 0
      silencePromise(this.audioEle.play())
      this.setPlaying(true)
      if (this.lyric.length > 0) {
        this.lyricIndex = 0
      }
    },
    // 修改音乐显示时长
    progressMusic(percent) {
      this.currentTime = this.currentMusic.duration * percent
    },
    // 修改音乐进度
    progressMusicEnd(percent) {
      this.audioEle.currentTime = this.currentMusic.duration * percent
    },
    // 切换播放顺序
    modeChange() {
      const mode = (this.mode + 1) % 4
      this.setPlayMode(mode)
      if (mode === PLAY_MODE.LOOP) {
        return
      }
      let list = []
      switch (mode) {
        case PLAY_MODE.LIST_LOOP:
        case PLAY_MODE.ORDER:
          list = this.orderList
          break
        case PLAY_MODE.RANDOM:
          list = randomSortArray(this.orderList)
          break
      }
      this.resetCurrentIndex(list)
      this.setPlaylist(list)
    },
    // 修改当前歌曲索引
    resetCurrentIndex(list) {
      const index = list.findIndex((item) => {
        return item.id === this.currentMusic.id
      })
      this.setCurrentIndex(index)
    },
    // 打开音乐评论
    openComment() {
      if (!this.currentMusic.id) {
        this.$mmToast('还没有播放歌曲哦！')
        return false
      }
      if (!this.commentOpen) {
        this.$router.push(`/music/comment/${this.currentMusic.id}`)
        this.setCommentOpen(true)
      } else {
        // this.$router.push(`/music/playlist`)
        this.$router.back()
      }
    },
    // 修改音量大小
    volumeChange(percent) {
      percent === 0 ? (this.isMute = true) : (this.isMute = false)
      this.volume = percent
      this.audioEle.volume = percent
      setVolume(percent)
    },
    // 获取播放模式 icon
    getModeIconType() {
      return {
        [PLAY_MODE.LIST_LOOP]: 'loop',
        [PLAY_MODE.ORDER]: 'sequence',
        [PLAY_MODE.RANDOM]: 'random',
        [PLAY_MODE.LOOP]: 'loop-one',
      }[this.mode]
    },
    // 获取播放模式 title
    getModeIconTitle() {
      const key = 'Ctrl + O'
      return {
        [PLAY_MODE.LIST_LOOP]: `列表循环 ${key}`,
        [PLAY_MODE.ORDER]: `顺序播放 ${key}`,
        [PLAY_MODE.RANDOM]: `随机播放 ${key}`,
        [PLAY_MODE.LOOP]: `单曲循环 ${key}`,
      }[this.mode]
    },
    // 查看歌词
    handleOpenLyric() {
      this.lyricVisible = true
      this.$nextTick(() => {
        this.$refs.lyric.clacTop()
      })
    },
    // 关闭歌词
    handleCloseLyric() {
      this.lyricVisible = false
    },
    // 获取歌词
    _getLyric(id) {
      const idTest = id + ''
      if (idTest.startsWith('BV')) {
        this.lyric = []
        return
      }
      getLyric(id).then((res) => {
        if (res.lrc && res.lrc.lyric) {
          this.nolyric = false
          this.lyric = parseLyric(res.lrc.lyric)
        } else {
          this.nolyric = true
        }
        silencePromise(this.audioEle.play())
      })
    },
    ...mapMutations({
      setPlaying: 'SET_PLAYING',
      setPlaylist: 'SET_PLAYLIST',
      setCurrentIndex: 'SET_CURRENTINDEX',
      setCommentOpen: 'SET_COMMENT_OPEN'
    }),
    ...mapActions(['setHistory', 'setPlayMode']),
  },
}
</script>

<style lang="less">
.router-view {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.music {
  padding: 75px 25px 25px 25px;
  width: 100%;
  max-width: 1750px;
  margin: 0 auto;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  .music-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    width: 100%;
    .music-left {
      flex: 1;
      width: 100%;
      overflow: hidden;
    }
    .music-right {
      position: relative;
      width: 310px;
      margin-left: 10px;
      .close-lyric {
        position: absolute;
        top: 0;
        z-index: 1;
        cursor: pointer;
      }
    }
  }

  /*底部mmPlayer-bar*/
  .music-bar {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 15px 0;
    color: #fff;
    &.disable {
      pointer-events: none;
      opacity: 0.6;
    }
    .icon-color {
      color: #fff;
    }
    .music-bar-btns {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 180px;
      .control-play {
        .flex-center;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        color: #fff;
        background-color: rgba(255, 255, 255, 0.3);
      }
    }

    .flex-center;
    .btn-prev {
      width: 19px;
      min-width: 19px;
      height: 20px;
      background-position: 0 -30px;
    }
    .btn-play {
      width: 21px;
      min-width: 21px;
      height: 29px;
      margin: 0 50px;
      background-position: 0 0;
      &.btn-play-pause {
        background-position: -30px 0;
      }
    }
    .btn-next {
      width: 19px;
      min-width: 19px;
      height: 20px;
      background-position: 0 -52px;
    }
    .music-music {
      position: relative;
      width: 100%;
      flex: 1;
      box-sizing: border-box;
      padding-left: 40px;
      font-size: @font_size_small;
      color: @text_color_active;
      .music-bar-info {
        height: 15px;
        padding-right: 80px;
        line-height: 15px;
        text-overflow: ellipsis;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      .music-bar-time {
        position: absolute;
        top: 0;
        right: 5px;
      }
    }

    .mode,
    .comment,
    .music-bar-volume {
      margin-left: 20px;
    }

    // 音量控制
    .volume-wrapper {
      margin-left: 20px;
      width: 150px;
    }
  }

  /*遮罩*/
  .mmPlayer-mask,
  .mmPlayer-bg {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
  }

  .mmPlayer-mask {
    z-index: -1;
    background-color: @mask_color;
  }

  .mmPlayer-bg {
    z-index: -2;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50%;
    filter: blur(12px);
    opacity: 0.7;
    transition: all 0.8s;
    transform: scale(1.1);
  }

  @media (min-width: 960px) {
    .close-lyric {
      display: none;
    }
  }

  //当屏幕小于960时
  @media (max-width: 960px) {
    .music-right {
      display: none;
      &.show {
        display: block;
        margin-left: 0;
        width: 100%;
      }
    }
  }
  //当屏幕小于768时
  @media (max-width: 768px) {
    padding: 75px 15px 5px 15px;

    .music-bar {
      padding-top: 10px;
      .music-bar-info span,
      .music-bar-volume .mmProgress {
        display: none;
      }
    }
  }
  //当屏幕小于520时
  @media (max-width: 520px) {
    .music-bar {
      position: relative;
      flex-direction: column;
      .music-bar-btns {
        width: 60%;
        margin-top: 10px;
        order: 2;
      }
      .music-music {
        padding-left: 0;
        order: 1;
      }
      .mode,
      .comment {
        position: absolute;
        bottom: 20px;
        margin: 0;
      }
      .mode {
        left: 5px;
      }
      .comment {
        right: 5px;
      }
      .music-bar-volume {
        display: none;
      }
    }
  }
}
</style>
