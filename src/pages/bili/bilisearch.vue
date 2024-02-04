<template>
  <div class="box">
    <mm-loading v-model="mmLoadShow"/>
    <!--    @TODO let search-head fixed when scroll-->
    <div class="search-head">
      <input
        v-model.trim="searchValue"
        class="search-input"
        type="text"
        placeholder="音乐/歌手"
        @keyup.enter="onEnter"
      />
    </div>
    <!--bili搜索-->
    <div class="videoList">
      <template v-if="list.length > 0">
        <div v-for="item in list" :key="item.bvid" class="list-item" :title="item.videoTitle">
          <div @click.stop="selectItem(item)" class="videoList-item">
            <!--      @TODO 点击后提示稍后再点,因为爬虫服务器在下载该资源.重复点击会导致爬虫服务器重复下载,浪费服务器资源 -->
            <img referrerPolicy="no-referrer" :src="`${item.coverPicUrl}@672w_378h_1c_!web-search-common-cover.avif`"
                 class="cover-img"/>
            <!--          只要带上v-lazy,referrerPolicy就无法生效-->
            <!--          <img referrerPolicy="no-referrer" v-lazy="`${item.coverPicUrl}@672w_378h_1c_!web-search-common-cover.avif`" class="cover-img"/>-->
            <!--            @TODO title 目前显示一行,只有几个字. 待优化-->
            <h3 class="name">{{ item.videoTitle }}</h3>
            <span class="duration">{{ item.duration }}</span> <!-- 添加视频时长元素 -->
<!--            @TODO 展示一下视频播放次数. 方便更准确地找到最合适的音频-->
          </div>
        </div>
      </template>
      <mm-no-result v-else title="Bilibili 干杯"/>
    </div>
  </div>
</template>

<script>
import {getAudioUrl, searchVideoResources} from 'api/index'
import {loadMixin} from '@/utils/mixin'
import { AUDIO_PATH } from '@/config'
import MmLoading from 'base/mm-loading/mm-loading'
import MmNoResult from 'base/mm-no-result/mm-no-result'
import {mapActions} from "vuex";

export default {
  name: 'BiliSearch',
  components: {
    MmLoading,
    MmNoResult,
  },
  mixins: [loadMixin],
  data() {
    return {
      searchValue: '青花瓷',
      list: [],
    }
  },
  created() {
    this.mmLoadShow = false
    this.searchVideo()
  },
  methods: {
    // 播放歌曲
    async selectItem(video) {
      console.log('selectVideo', video)
      try {
        await this._getMusicDetail(video.bvid)
        const url = `${AUDIO_PATH}/download//bvid_${video.bvid}.mp3`
        const music = {}
        music.image = video.coverPicUrl
        const format = video.duration.split(':') //视频duration最小单位是秒, 匹配歌词的话可能有误差
        const minute = parseInt(format[0])
        const second = parseInt(format[1])
        music.duration = minute * 60 + second
        music.id = video.bvid
        music.name = video.videoTitle
        music.url = url
        console.log('created music')
        console.log(music)
        this.selectAddPlay(music)
      } catch (error) {
        this.$mmToast('哎呀，出错啦~')
      }
    },
    // 获取歌曲详情
    _getMusicDetail(bvid) {
      return getAudioUrl(bvid).then()
    },
    ...mapActions(['selectAddPlay']),
    // 搜索事件
    onEnter() {
      if (this.searchValue.replace(/(^\s+)|(\s+$)/g, '') === '') {
        this.$mmToast('搜索内容不能为空！')
        return
      }
      this.mmLoadShow = true
      this.searchVideo()
    },
    // 搜索
    searchVideo() {
      searchVideoResources(this.searchValue, '')
        .then((res) => {
          if (res.data.code !== 200) {
            this.$mmToast('code != 200')
            return
          }
          // console.log(res.data)
          this.list = res.data.result
          this.mmLoadShow = false
        }).catch((err) => {
        this.$mmToast('network error')
      })
    },
  },
}
</script>

<style lang="less" scoped>
.duration {
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px 5px;
  font-size: 15px;
  border-radius: 2px;
}

.search-head {
  display: flex;
  height: 40px;
  padding: 10px 15px;
  overflow: hidden;
  background: @search_bg_color;

  span {
    line-height: 40px;
    margin-right: 15px;
    cursor: pointer;

    &:hover {
      color: @text_color_active;
    }

    @media (max-width: 640px) {
      & {
        display: none;
      }
    }
  }

  .search-input {
    flex: 1;
    height: 40px;
    box-sizing: border-box;
    padding: 0 15px;
    border: 1px solid @btn_color;
    outline: 0;
    background: transparent;
    color: @text_color_active;
    font-size: @font_size_medium;
    box-shadow: 0 0 1px 0 #fff inset;

    &::placeholder {
      color: @text_color;
    }
  }
}

.videoList {
  margin-top: 20px;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  .list-item {
    //float: left;
    float: left;
    width: calc(~'100% / 7');

    .videoList-item {
      position: relative;
      width: 130px;
      text-align: center;
      cursor: pointer;
      margin: 0 auto 20px;

      &:hover {
        color: #fff;
      }

      .name {
        height: 30px;
        line-height: 30px;
        font-size: @font_size_medium;
        .no-wrap();
      }

      @media (max-width: 1100px) {
        width: 80%;
      }
    }

    @media (max-width: 1500px) {
      width: calc(~'100% / 6');
    }
    @media (max-width: 1400px), (max-width: 960px) {
      width: calc(~'100% / 5');
    }
    @media (max-width: 1280px), (max-width: 768px) {
      width: calc(~'100% / 4');
    }
    @media (max-width: 540px) {
      width: calc(~'100% / 3');
    }
  }
}
</style>
