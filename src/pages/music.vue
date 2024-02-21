<template>
  <div class="music flex-col">
    <div class="music-content">
      <div class="music-left flex-col">
        <music-btn @onClickLyric="handleOpenLyric"/>
<!--        detail组件一定不要keep-alive. 因为要让每次打开时自动-->
        <keep-alive :include="['PlayList', 'UserList', 'TopList', 'Search', 'HistoryList', 'BiliSearch']">
          <router-view class="router-view"/>
        </keep-alive>
      </div>
      <!--这个歌词div默认在router-view一侧. 当show类被添加后,会覆盖整个屏幕, 但router-view并不受影响-->
      <div class="music-right" :class="{ show: lyricVisible }">
        <div class="close-lyric" @click="handleCloseLyric">关闭歌词</div>
        <lyric ref="lyric" :lyric="lyric" :lyricType="lyricType" :lyric-index="lyricIndex"/>
      </div>
    </div>

    <!-- 播放器 -->
    <div class="music-bar" :class="{ disable: !musicReady || !currentMusic.id }">
      <div class="music-bar-btns">
        <mm-icon class="pointer" type="prev" :size="36" title="上一曲 Ctrl + Left" @click="prev"/>
        <div class="control-play pointer" title="播放暂停 Ctrl + Space" @click="play">
          <mm-icon :type="playing ? 'pause' : 'play'" :size="24"/>
        </div>
        <mm-icon class="pointer" type="next" :size="36" title="下一曲 Ctrl + Right" @click="next"/>
      </div>
      <div class="music-music">
        <div class="music-bar-info">
          <template v-if="currentMusic && currentMusic.id">
            {{ currentMusic.name }}
            <span>&nbsp;-&nbsp;&nbsp;{{ currentMusic.singer }}</span>
          </template>
          <template v-else>欢迎使用Music Collection在线音乐播放器</template>
        </div>
        <div v-if="currentMusic.id" class="music-bar-time">
          {{ currentTime | format }}/{{ currentMusic.duration % 3600 | format }}
        </div>
        <div v-if="quality" class="quality">
          {{ quality}}
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

      <!-- 暂时只给网易平台歌曲提供评论 -->
      <mm-icon v-show="Object.keys(currentMusic).length !== 0 && currentMusic.platform === 'netease'"
        class="icon-color pointer comment" type="comment" :size="30" @click="openComment"/>
      <!-- 添加到歌单 -->
<!--      <mm-icon v-show="Object.keys(currentMusic).length !== 0 && currentMusic.platform !== 'bili'"
               class="icon-color pointer comment" type="comment" :size="30" @click="openDialog(0)"/>-->

      <mm-icon v-show="Object.keys(currentMusic).length !== 0 && currentMusic.platform !== 'bili'"
               class="icon-color pointer jiahao" type="jiahao" :size="30" @click="openDialog(0)"/>

      <!--选择歌单进行添加歌曲-->
      <mm-dialog
        ref="addMusicToListDialog2"
        head-text="添加歌曲到歌单"
        confirm-btn-text="添加"
        cancel-btn-text="取消"
        @confirm="addCustomList"
      >
        <div class="mm-dialog-text">
          (输入完回车或点击空白区域检查内容变化,勿直接点击"添加")
          <el-select
            v-model="chosenMusicListTitle"
            filterable
            allow-create
            default-first-option
            placeholder="请选择歌单名称或输入新歌单名称">
            <el-option
              v-for="item in customMusicListMap"
              :key="item.id"
              :label="item.title"
              :value="item.title">
            </el-option>
            <!--@TODO disabled属性可以禁止选用该option,可以通过判断歌单歌曲是否到达300首进行禁用-->
          </el-select>
        </div>
      </mm-dialog>

      <!-- 音量控制 -->
      <!--@TODO 样式有bug: 在最窄的屏幕中静音再撤回静音, 在扩大屏幕宽度后音量进度条没有展开-->
      <div class="music-bar-volume" title="音量加减 [Ctrl + Up / Down]">
        <volume :volume="volume" @volumeChange="volumeChange"/>
      </div>
    </div>

    <!--遮罩-->
    <!--如果是b站视频,图片请求不能携带referer. 而这里背景图片请求无法修改referer. 暂时不解决它, 未来直接从QQ音乐平台获取正版封面-->
    <div class="mmPlayer-bg" :style="{ backgroundImage: `url(${this.currentMusic.image}` }"></div>
    <div class="mmPlayer-mask"></div>
  </div>
</template>

<script>
import {
  getAudioUrlFromBili,
  getLyric,
  getQQLyric,
  getQQMusicUrl,
  getQQMusicVipOneMinuteUrl,
  searchBili
} from 'api/index'
import mmPlayerMusic from './mmPlayer'
import {randomSortArray, parseLyric, format, silencePromise, generateUUID} from '@/utils/util'
import {PLAY_MODE, MMPLAYER_CONFIG} from '@/config'
import {getBindInfo, getVolume, setVolume} from '@/utils/storage'
import {mapGetters, mapMutations, mapActions} from 'vuex'

import MmProgress from 'base/mm-progress/mm-progress'
import MusicBtn from 'components/music-btn/music-btn'
import Lyric from 'components/lyric/lyric'
import Volume from 'components/volume/volume'
import {audioEle} from "@/store/getters";
import cloneDeep from "lodash/cloneDeep";
import MmDialog from 'base/mm-dialog/mm-dialog'
import {createCustomMusicListInfo} from "@/utils/music_list/MusicListInfo";
import {createComplexSong} from "@/utils/createComplexSong";

export default {
  name: 'Music',
  components: {
    MmProgress,
    MusicBtn,
    Lyric,
    Volume,
    MmDialog,
  },
  filters: {
    // 时间格式化
    format,
  },
  data() {
    const volume = getVolume()
    return {
      musicListDesc: '',
      musicListTag: [],
      musicListCoverImg: 'https://qpic.y.qq.com/music_cover/UwsgicvXzUsibGjO09TicjLpzMS4lkZbvGbzBjyxibwUDiaTDJibuib1nxIGw/600?n=1',
      chosenMusicListTitle: '',
      musicReady: false, // 是否可以使用播放器
      currentTime: 0, // 当前播放时间
      currentProgress: 0, // 当前缓冲进度
      lyricVisible: false, // 控制歌词div的类show,当为true时,div会调整到指定样式覆盖整个屏幕
      lyric: [], // 歌词
      lyricType: 0, // 0: 没找到歌词 1:有个词 2:确定是纯音乐
      lyricIndex: 0, // 当前播放歌词下标
      isMute: false, // 是否静音
      volume, // 音量大小,
      quality: '',
      // autoSearchAudioSource: true, //自动
      candidateSongs: [],
      // useBindAudio: true,
    }
  },
  computed: {
    customMusicListMap() {
      // //console.log('this.musicListMap', this.musicListMap)
      // //console.log('222222222222', this.musicListMap.filter(item => item.platform === 'custom').map(item => item))
      return this.musicListMap.filter(item => item.platform === 'custom').map(item => item)
    },
    /*quality() {
      //console.log('1lkjlhlh')
      if ((this.currentMusic.platform === 'complex' || this.currentMusic.platform === 'bili')  && this.currentMusic.audioSource.urls[0]) {
        //console.log('this.currentMusic.audioSource.urls[0]', this.currentMusic.audioSource.urls[0])
        return this.currentMusic.audioSource.urls[0].quality
      }
    },*/
    // background-img
 /*   picUrl() {
      const idTest = this.currentMusic.id + ''
      if (idTest.startsWith('BV')) {
        return `url(${this.currentMusic.image})`
      }

      return this.currentMusic.id && this.currentMusic.image
        ? `url(${this.currentMusic.image}?param=300y300)`
        : `url(${MMPLAYER_CONFIG.BACKGROUND})`
    },*/
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
      'musicListMap',
      'manageMusicListRes',
      'autoSearchAudioSource',
      'useBindAudio',
    ]),
  },
  watch: {
    // 这里监测vuex中的currentMusic对象, prev/next/play()等函数改动的是currentIndex.
    //而getters.js中state.playlist[state.currentIndex], 所以改动currentIndex会影响currentMusic
    currentMusic(newMusic, oldMusic) {
     this.currentMusic2(newMusic, oldMusic)
    },
    /*currentMusicOld(newMusic, oldMusic) {
      //console.log('@@@@@@@@ music.vue#watch currentMusic')
      //console.log('currentMusic newMusic=', newMusic)
      if (!newMusic.id) {
        this.lyric = []
        return
      }

      if (newMusic.id === oldMusic.id) {
        //console.log('新旧musicId相同')
        return
      }

      let getUrl = null
      if (this.autoSearchAudioSource && newMusic.limit !== 0 && newMusic.limit !== 8) {

        //console.log('a########### audoSearchAudio ')
        getUrl = this.exactSearchAudio(newMusic, true).then(candidates => {
          //console.log('replace now !!!!!!!!!')
          this.candidatesSong = candidates
          this.insertCurrentMusic(candidates[0])
          newMusic = candidates[0]
          //console.log('replace success!!!!!!!!!')
          //console.log('newMusic=', newMusic)
          //console.log('candidates=', candidates)
        })
        //console.log('agadfa!!!!!!')
      }
      if (newMusic.platform === 'qq') {
        if (newMusic.limit === 0){
          getUrl = getQQMusicUrl(`"${newMusic.id}"`).then((data) => {
            //console.log('getQQMusicUrl=========')
            //console.log(data)
            const songUrl = data.req_0.data.midurlinfo[0].purl
            // this.audioEle.src = `http://dl.stream.qqmusic.qq.com/` + songUrl
            this.audioEle.src = newMusic.url + songUrl
            //console.log('this.audioEle.src', this.audioEle.src)
          })
        }
        else {
          const vipMidsStr = `"${newMusic.id}"`
          const vipMediaMidsStr = `"RS02${newMusic.audioSource.media_mid}.mp3"`
          getUrl = getQQMusicVipOneMinuteUrl(vipMidsStr, vipMediaMidsStr).then(data => {
            //console.log('getQQMusicVipOneMinuteUrl===')
            //console.log(data)
            const vipUrl = data.req_0.data.midurlinfo[0].purl
            this.audioEle.src = newMusic.audioSource.url + vipUrl
            //console.log(' this.audioEle.src',  this.audioEle.src)
          })
        }
      }
      else if (newMusic.platform === 'netease') {
        // 在官方平台上有音频
        this.audioEle.src = newMusic.url
        this.quality = '' //平台歌曲默认都是128kbps,统一不展示了

        /!*this.lyricIndex = this.currentTime = this.currentProgress = 0
        silencePromise(this.audioEle.play())
        this.$nextTick(() => {
          this._getLyric(newMusic)
        })*!/
      } else {
        // 音源在audioSource中
        getUrl = getAudioUrlFromBili(newMusic.audioSource.bvid, newMusic.audioSource.cid).then(data => {
          const audios = data.data.dash.audio
          const urls = []
          for (let i = 0; i < audios.length; i++) {
            const quality = (Math.round(audios[i].bandwidth / 1000)) + 'kbps'
            const url = audios[i].baseUrl
            const urlObj = {quality, url}
            urls.push(urlObj)
          }
          // newMusic.audioSource.urls = urls // 因为currentMusic对象被vuex管理,所以其中的属性修改时要用mutation的方式
          this.setMusicAudioUrls(urls)
          //console.log('ghjkgkjg')
        }).then(() => {
          // @TODO 这里默认使用urls[0], 没有考虑"urls[0]不可用"的情况
          this.audioEle.src = newMusic.audioSource.urls[0].url
          this.quality = newMusic.audioSource.urls[0].quality

          /!*this.lyricIndex = this.currentTime = this.currentProgress = 0
          silencePromise(this.audioEle.play())
          this.$nextTick(() => {
            this._getLyric(newMusic)
          })*!/
        })
      }

      if (getUrl) {
        getUrl.then(() => {
          this.lyricIndex = this.currentTime = this.currentProgress = 0
          //console.log('aaaa123114342')
          silencePromise(this.audioEle.play())
          this.$nextTick(() => {
            this._getLyric(newMusic)
          })
        })
      } else {
        this.lyricIndex = this.currentTime = this.currentProgress = 0
        //console.log('aaaa123114342')
        silencePromise(this.audioEle.play())
        this.$nextTick(() => {
          this._getLyric(newMusic)
        })
      }

      //这是没有抽出play()和_getLyric()时的代码,暂时保留
/!*      if (newMusic.platform === 'qq') {
        if (newMusic.limit === 0){
          getQQMusicUrl(`"${newMusic.id}"`).then((data) => {
            //console.log('getQQMusicUrl=========')
            //console.log(data)
            const songUrl = data.req_0.data.midurlinfo[0].purl
            this.audioEle.src = `http://dl.stream.qqmusic.qq.com/` + songUrl
            // newMusic.url += songsUrlInfo[i].purl
            //console.log('this.audioEle.src', this.audioEle.src)
            this.lyricIndex = this.currentTime = this.currentProgress = 0
            //console.log('aaaa123114342')
            silencePromise(this.audioEle.play())
            this.$nextTick(() => {
              this._getLyric(newMusic)
            })
          })
        }
        else {
          const vipMidsStr = `"${newMusic.id}"`
          const vipMediaMidsStr = `"RS02${newMusic.audioSource.media_mid}.mp3"`
          getQQMusicVipOneMinuteUrl(vipMidsStr, vipMediaMidsStr).then(data => {
            //console.log('getQQMusicVipOneMinuteUrl===')
            //console.log(data)
            const vipUrl = data.req_0.data.midurlinfo[0].purl
            // formattedSongs[i].url += vipUrl.purl
            this.audioEle.src = newMusic.audioSource.url + vipUrl
            //console.log(' this.audioEle.src',  this.audioEle.src)
            this.lyricIndex = this.currentTime = this.currentProgress = 0
            //console.log('aaaa123114342')
            silencePromise(this.audioEle.play())
            this.$nextTick(() => {
              this._getLyric(newMusic)
            })
          })
        }
      }
      // if (newMusic.platform !== 'complex' && newMusic.platform !== 'bili') {
      else if (newMusic.platform === 'netease') {
        // 在官方平台上有音频
        this.audioEle.src = newMusic.url
        this.quality = '' //平台歌曲默认都是128kbps,统一不展示了
        this.lyricIndex = this.currentTime = this.currentProgress = 0
        silencePromise(this.audioEle.play())
        this.$nextTick(() => {
          this._getLyric(newMusic)
        })
        // //console.log('郭洪智参乎上')
      } else {
        // 音源在audioSource中
        // //console.log('1421312313')
        getAudioUrlFromBili(newMusic.audioSource.bvid, newMusic.audioSource.cid).then(data => {
          const audios = data.data.dash.audio
          const urls = []
          for (let i = 0; i < audios.length; i++) {
            const quality = (Math.round(audios[i].bandwidth / 1000)) + 'kbps'
            const url = audios[i].baseUrl
            const urlObj = {quality, url}
            urls.push(urlObj)
            //console.log('mhgfjh142134123')
          }
          //console.log('jfhjfjh1421312313')
          // newMusic.audioSource.urls = urls // 因为currentMusic对象被vuex管理,所以其中的属性修改时要用mutation的方式
          this.setMusicAudioUrls(urls)
          //console.log('ghjkgkjg')
        })
          .then(() => {
          //console.log('123114342')
          this.audioEle.src = newMusic.audioSource.urls[0].url
          this.quality = newMusic.audioSource.urls[0].quality
          this.lyricIndex = this.currentTime = this.currentProgress = 0
          //console.log('aaaa123114342')
          silencePromise(this.audioEle.play())
          this.$nextTick(() => {
            this._getLyric(newMusic)
          })
          // //console.log('promuse  郭洪智参乎上')
        })*!/

        /*console.log("newMusic=", newMusic)
        //console.log("quality=", newMusic.audioSource.urls[0].quality)*!/
        //this.audioEle.src = newMusic.audioSource.urls[0].url

       重置相关参数
      this.lyricIndex = this.currentTime = this.currentProgress = 0
      silencePromise(this.audioEle.play())
      this.$nextTick(() => {
        this._getLyric(newMusic)
      })
      }
    },*/
    // 点击播放/暂停按钮后, 修改playing的值
    playing(newPlaying) {
      //console.log("@@@@@@@@@@ playing====", newPlaying)
      const audio = this.audioEle
      this.$nextTick(() => {
        newPlaying ? silencePromise(audio.play()) : audio.pause()
        this.musicReady = true
        //console.log('nextTick end')
      })
    },
    //监测currentTime为了修改lyricIndex
    currentTime(newTime) {
      if (this.lyricType !== 1) {
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
    //console.log("currentMusic==", this.currentMusic)
    this.$nextTick(() => {
      mmPlayerMusic.initAudio(this)
      this.initKeyDown()
      // 初始化的音量调整
      this.volumeChange(this.volume)
    })
  },
  methods: {
    async currentMusic2(newMusic, oldMusic) {
      //console.log('@@@@@@@@ music.vue#watch currentMusic')
      //console.log('currentMusic newMusic=', newMusic)
      if (!newMusic.id) {
        this.lyric = []
        return
      }

      if (newMusic.id === oldMusic.id) {
        //console.log('新旧musicId相同')
        return
      }

      if (newMusic.platform !== 'complex' && newMusic.platform !== 'bili' && this.useBindAudio) {
        //console.log('this.useBindAudio', this.useBindAudio)
        const bindInfo = getBindInfo(newMusic.id)
        if (bindInfo !== null) {
          const {bvid, cid} = bindInfo.audioInfo
          // const {bvid, cid} = getBindInfo(newMusic.id)
          //console.log('bindInfo===', bindInfo)
          //console.log('audioInfo==', bvid, cid)
          const complexMusic = cloneDeep(newMusic)
          complexMusic.platform = 'complex'
          complexMusic.id = newMusic.id + '-' + bvid
          complexMusic.limit = 0
          complexMusic.audioSource = {bvid: bvid, cid: cid}
          complexMusic.duration = complexMusic.originDuration
          this.insertCurrentMusic(complexMusic)
          //console.log('complexMusic====', complexMusic)
          return
        }
      }

      let getUrl = null
      if (newMusic.platform !== 'complex' && this.autoSearchAudioSource && newMusic.limit && newMusic.limit !== 0 && newMusic.limit !== 8) {

        //console.log('a########### audoSearchAudio ')
        await this.exactSearchAudio(newMusic, true).then(candidates => {
          //console.log('replace now !!!!!!!!!')
          this.candidateSongs = candidates
          // this.replaceCurrentMusic(candidates[0])
          // newMusic = candidates[0]
          // this.setCurrentIndex(this.currentIndex)
          // return
          // //console.log('newMusic=', newMusic)
          // //console.log('candidates=', candidates)
        })
        //this.next()
        if (this.candidateSongs.length >= 1) {
          //console.log('candidates=', this.candidateSongs)
          this.insertCurrentMusic(this.candidateSongs[0])
          //console.log('insert success!!!!!!!!!', this.playlist)
          return
        }
        // //console.log('agadfa!!!!!!')
      }
      if (newMusic.platform === 'qq') {
        if (newMusic.limit === 0){
          getUrl = getQQMusicUrl(`"${newMusic.id}"`).then((data) => {
            //console.log('getQQMusicUrl=========')
            //console.log(data)
            const songUrl = data.req_0.data.midurlinfo[0].purl
            // this.audioEle.src = `http://dl.stream.qqmusic.qq.com/` + songUrl
            this.audioEle.src = newMusic.url + songUrl
            //console.log('this.audioEle.src', this.audioEle.src)
            this.quality = ''
          })
        }
        else {
          const vipMidsStr = `"${newMusic.id}"`
          const vipMediaMidsStr = `"RS02${newMusic.audioSource.media_mid}.mp3"`
          getUrl = getQQMusicVipOneMinuteUrl(vipMidsStr, vipMediaMidsStr).then(data => {
            //console.log('getQQMusicVipOneMinuteUrl===')
            //console.log(data)
            const vipUrl = data.req_0.data.midurlinfo[0].purl
            this.audioEle.src = newMusic.audioSource.url + vipUrl
            this.quality = ''
            //console.log(' this.audioEle.src',  this.audioEle.src)
          })
        }
      }
      else if (newMusic.platform === 'netease') {
        // 在官方平台上有音频
        this.audioEle.src = newMusic.url
        this.quality = '' //平台歌曲默认都是128kbps,统一不展示了

        /*this.lyricIndex = this.currentTime = this.currentProgress = 0
        silencePromise(this.audioEle.play())
        this.$nextTick(() => {
          this._getLyric(newMusic)
        })*/
      } else {
        //console.log('complex play00000')
        // 音源在audioSource中
        getUrl = getAudioUrlFromBili(newMusic.audioSource.bvid, newMusic.audioSource.cid).then(data => {
          const audios = data.data.dash.audio
          const urls = []
          for (let i = 0; i < audios.length; i++) {
            const quality = (Math.round(audios[i].bandwidth / 1000)) + 'kbps'
            const url = audios[i].baseUrl
            const urlObj = {quality, url}
            urls.push(urlObj)
          }
          // newMusic.audioSource.urls = urls // 因为currentMusic对象被vuex管理,所以其中的属性修改时要用mutation的方式
          this.setMusicAudioUrls(urls)
          //console.log('ghjkgkjg')
        }).then(() => {
          // @TODO 这里默认使用urls[0], 没有考虑"urls[0]不可用"的情况
          this.audioEle.src = newMusic.audioSource.urls[0].url
          this.quality = newMusic.audioSource.urls[0].quality

          /*this.lyricIndex = this.currentTime = this.currentProgress = 0
          silencePromise(this.audioEle.play())
          this.$nextTick(() => {
            this._getLyric(newMusic)
          })*/
        })
      }

      if (getUrl) {
        getUrl.then(() => {
          this.lyricIndex = this.currentTime = this.currentProgress = 0
          //console.log('aaaa123114342')
          silencePromise(this.audioEle.play())
          this.$nextTick(() => {
            this._getLyric(newMusic)
          })
        })
      } else {
        this.lyricIndex = this.currentTime = this.currentProgress = 0
        //console.log('aaaa123114342')
        silencePromise(this.audioEle.play())
        this.$nextTick(() => {
          this._getLyric(newMusic)
        })
      }

      //这是没有抽出play()和_getLyric()时的代码,暂时保留
      /*      if (newMusic.platform === 'qq') {
              if (newMusic.limit === 0){
                getQQMusicUrl(`"${newMusic.id}"`).then((data) => {
                  //console.log('getQQMusicUrl=========')
                  //console.log(data)
                  const songUrl = data.req_0.data.midurlinfo[0].purl
                  this.audioEle.src = `http://dl.stream.qqmusic.qq.com/` + songUrl
                  // newMusic.url += songsUrlInfo[i].purl
                  //console.log('this.audioEle.src', this.audioEle.src)
                  this.lyricIndex = this.currentTime = this.currentProgress = 0
                  //console.log('aaaa123114342')
                  silencePromise(this.audioEle.play())
                  this.$nextTick(() => {
                    this._getLyric(newMusic)
                  })
                })
              }
              else {
                const vipMidsStr = `"${newMusic.id}"`
                const vipMediaMidsStr = `"RS02${newMusic.audioSource.media_mid}.mp3"`
                getQQMusicVipOneMinuteUrl(vipMidsStr, vipMediaMidsStr).then(data => {
                  //console.log('getQQMusicVipOneMinuteUrl===')
                  //console.log(data)
                  const vipUrl = data.req_0.data.midurlinfo[0].purl
                  // formattedSongs[i].url += vipUrl.purl
                  this.audioEle.src = newMusic.audioSource.url + vipUrl
                  //console.log(' this.audioEle.src',  this.audioEle.src)
                  this.lyricIndex = this.currentTime = this.currentProgress = 0
                  //console.log('aaaa123114342')
                  silencePromise(this.audioEle.play())
                  this.$nextTick(() => {
                    this._getLyric(newMusic)
                  })
                })
              }
            }
            // if (newMusic.platform !== 'complex' && newMusic.platform !== 'bili') {
            else if (newMusic.platform === 'netease') {
              // 在官方平台上有音频
              this.audioEle.src = newMusic.url
              this.quality = '' //平台歌曲默认都是128kbps,统一不展示了
              this.lyricIndex = this.currentTime = this.currentProgress = 0
              silencePromise(this.audioEle.play())
              this.$nextTick(() => {
                this._getLyric(newMusic)
              })
              // //console.log('郭洪智参乎上')
            } else {
              // 音源在audioSource中
              // //console.log('1421312313')
              getAudioUrlFromBili(newMusic.audioSource.bvid, newMusic.audioSource.cid).then(data => {
                const audios = data.data.dash.audio
                const urls = []
                for (let i = 0; i < audios.length; i++) {
                  const quality = (Math.round(audios[i].bandwidth / 1000)) + 'kbps'
                  const url = audios[i].baseUrl
                  const urlObj = {quality, url}
                  urls.push(urlObj)
                  //console.log('mhgfjh142134123')
                }
                //console.log('jfhjfjh1421312313')
                // newMusic.audioSource.urls = urls // 因为currentMusic对象被vuex管理,所以其中的属性修改时要用mutation的方式
                this.setMusicAudioUrls(urls)
                //console.log('ghjkgkjg')
              })
                .then(() => {
                //console.log('123114342')
                this.audioEle.src = newMusic.audioSource.urls[0].url
                this.quality = newMusic.audioSource.urls[0].quality
                this.lyricIndex = this.currentTime = this.currentProgress = 0
                //console.log('aaaa123114342')
                silencePromise(this.audioEle.play())
                this.$nextTick(() => {
                  this._getLyric(newMusic)
                })
                // //console.log('promuse  郭洪智参乎上')
              })*/

      /*console.log("newMusic=", newMusic)
      //console.log("quality=", newMusic.audioSource.urls[0].quality)*/
      //this.audioEle.src = newMusic.audioSource.urls[0].url

      /*// 重置相关参数
      this.lyricIndex = this.currentTime = this.currentProgress = 0
      silencePromise(this.audioEle.play())
      this.$nextTick(() => {
        this._getLyric(newMusic)
      })
      }*/
    },
    async exactSearchAudio(reference, checkoutDuration = true) {
      const keyword = reference.name + ' ' + reference.singer + ' hi-res ' + ' 杜比 ' + ' 无损 '
      const desiredDataCount = 4;
      const maxReq = 2 //最多查询次数
      const validData = []
      let page = 1;
      while (validData.length < desiredDataCount && page <= maxReq) {
        try {
          const data = await searchBili(keyword, page);
          const list = data.data.result;

          list.forEach(item => {
            const durationFormat = item.duration.split(':') //视频duration最小单位是秒, 匹配歌词的话可能有误差
            const minute = parseInt(durationFormat[0])
            const second = parseInt(durationFormat[1])
            const duration = (minute * 60 + second)
            if (!checkoutDuration || Math.abs(duration - reference.originDuration) <= 4) {
              item.title = item.title.replace(/<em class="keyword">|<\/em>/g, '')
              item.lyricSource = {platform: reference.platform, songId: reference.id}
              const complex = {
                id: reference.id + '-' + item.bvid,
                name: reference.name,
                subTitle: reference.subTitle,
                singer: reference.singer,
                album: reference.album,
                image: reference.image,
                // duration: duration,
                originDuration: reference.originDuration,
                mixInfo: {audioSourceFrom: 'bili', others: reference.platform},
              }
              item.complex = complex
              //@TODO 有重复bvid, 按道理来说,分页查询重复可能性不大. 暂时不管这个bug
              createComplexSong(item).then((complexSong) => {
                validData.push(complexSong)
              })
            }
          })
          // //console.log('validData=', validData)
          if (list.length < 20) {
            break;
          }
          page++;
        } catch (error) {
          console.error('Error fetching data:', error);
          break;
        }
      }
      return validData
    },
    // 添加歌曲到自建歌单
    addCustomList() {
      this.setManageMusicListRes(false)
      //console.log("addCustomList==")
      //console.log(this.chosenMusicListTitle)
      //console.log(this.musicListMap)
      if (this.chosenMusicListTitle.replace(/(^\s+)|(\s+$)/g, '') === '') {
        this.$mmToast('歌单名称不能为空！')
        return
      }
      let id = ''
      for (let i = 0; i < this.musicListMap.length; i++) {
        if (this.musicListMap[i].title === this.chosenMusicListTitle) {
          id = this.musicListMap[i].id
          break;
        }
      }
      if (id === '') {
        id = generateUUID()
        //console.log('id==', id)
        const musicListInfo = createCustomMusicListInfo(id, this.chosenMusicListTitle, this.musicListDesc, this.musicListCoverImg, this.musicListTag)
        this.addMusicListToLocal(musicListInfo)
        if (!this.manageMusicListRes) {
          this.$mmToast('歌单数量限制')
          return
        }
      }
      let cloneObj = {}
      cloneObj = cloneDeep(this.currentMusic)
      cloneObj.audioSource ? cloneObj.audioSource.urls = null : 0 //去除urls, 因为bili的url会自动刷新
      this.addMusicToCustomList({music: cloneObj, id})
      if (!this.manageMusicListRes) {
        this.$mmToast('song list contains limit or exists music')
      } else {
        this.$mmToast('add success')
      }
    },
    // 打开对话框
    openDialog(key) {
      switch (key) {
        case 0:
          this.$refs.addMusicToListDialog2.show()
          break
        case 1:
          this.$refs.addMusicToListDialog2.hide()
      }
    },
    // 获取歌词
    _getLyric(music) {
      if (music.lyricSource && music.lyricSource.platform === 'netease') {
        getLyric(music.lyricSource.songId).then((res) => {
          if (res.lrc && res.lrc.lyric) {
            ////console.log('res.lyric=', res.lrc.lyric) // 有的歌曲歌词是这样'[00:00.00-1] 作词 : 初梦', 会解析不出来
            this.lyric = parseLyric(res.lrc.lyric, 'netease')
            ////console.log('netease lyric', this.lyric)
            this.lyricType = 1
          } else {
            this.lyricType = 0
          }
          silencePromise(this.audioEle.play())
        })
      } else if (music.lyricSource && music.lyricSource.platform === 'qq') {
        getQQLyric(music.lyricSource.songId).then(data => {
          if (data.req_0.data.lyric) {
            const lyricBase64 = data.req_0.data.lyric
            if (lyricBase64 === 'WzAwOjAwOjAwXeatpOatjOabsuS4uuayoeacieWhq+ivjeeahOe6r+mfs+S5kO+8jOivt+aCqOaso+i1jw==') {
              // 这是qq音乐纯音乐的歌词提示
              this.lyricType = 2
              return
            }
            const lyricStr = decodeURIComponent(atob(lyricBase64).split('').map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            this.lyric = parseLyric(lyricStr, 'qq')
            this.lyricType = 1
          } else {
            this.lyricType = 0
          }
        })
      } else {
        this.lyricType = 0
      }
    },
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
        playlist: {length},
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
        //console.log('this.currentIndex + 1')
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

    ...mapMutations({
      setPlaying: 'SET_PLAYING',
      setPlaylist: 'SET_PLAYLIST',
      setCurrentIndex: 'SET_CURRENTINDEX',
      setCommentOpen: 'SET_COMMENT_OPEN',
      setMusicAudioUrls: 'SET_MUSIC_AUDIO_URLS',
      insertCurrentMusic: 'INSERT_CURRENT_MUSIC',
      setManageMusicListRes: 'SET_MANAGE_MUSIC_LIST_RES',
    }),
    ...mapActions(['setHistory', 'setPlayMode', 'addMusicToCustomList' ,'addMusicListToLocal']),
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
        padding-right: 120px;
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
      .quality {
        position: absolute;
        top: 0;
        right: 75px;
        color: #fadb14;
      }
    }

    .mode,
    .comment,
    .jiahao,
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
