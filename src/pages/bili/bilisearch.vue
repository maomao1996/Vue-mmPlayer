<template>
  <div class="box">
    <mm-loading v-model="mmLoadShow"/>
    <!-- @TODO 样式优化: let search-head fixed when scroll-->
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
            <img referrerPolicy="no-referrer" :src="`https:${item.pic}@672w_378h_1c_!web-search-common-cover.avif`"
                 class="cover-img"/>
            <!-- 只要带上v-lazy,referrerPolicy就无法生效-->
            <!-- <img referrerPolicy="no-referrer" v-lazy="`${item.coverPicUrl}@672w_378h_1c_!web-search-common-cover.avif`" class="cover-img"/>-->
            <!-- @TODO title 目前显示一行,只有几个字. 待优化-->
            <h3 class="name">{{ item.title }}</h3>
            <span class="duration">{{ item.duration }}</span> <!-- 添加视频时长元素 -->
          </div>
        </div>
      </template>
      <mm-no-result v-else title="Bilibili 干杯"/>
    </div>
  </div>
</template>

<script>
import {searchBili} from 'api/index'
import {loadMixin} from '@/utils/mixin'
import MmLoading from 'base/mm-loading/mm-loading'
import MmNoResult from 'base/mm-no-result/mm-no-result'
import {mapState, mapActions, mapMutations} from "vuex";
import {createBiliSong} from "@/utils/createBiliSong";
import {createComplexSong} from "@/utils/createComplexSong";

export default {
  name: 'BiliSearch',
  components: {
    MmLoading,
    MmNoResult,
  },
  mixins: [loadMixin],
  data() {
    return {
      searchValue: '爱情转移',
      list: [],
    }
  },
  computed: {
    ...mapState(['searchAudio'])
  },
  created() {
    this.mmLoadShow = false
    //this.searchVideo()
  },
  activated() {
    this.mmLoadShow = true
    // 路由跳转后, 全局变量中存在一个要搜索的music. 取出music信息搜索并删除该全局变量,表示已经搜索完毕
    if (!this.searchAudio) {
      this.mmLoadShow = false
      return
    }
    if (this.searchAudio.audioSource && this.searchAudio.audioSource.tryBind) {
      this.searchValue = this.searchAudio.audioSource.tryBind
      this.exactSearchAudio(this.searchAudio, false).then(list => {
        //console.log('list=', list)
        this.list = list
        this.mmLoadShow = false
      })
    } else {
      this.searchValue = this.searchAudio.name + ' ' + this.searchAudio.singer + ' hi-res ' + ' 杜比 ' + ' 无损 '
      //console.log('searchAudio', this.searchAudio)
      this.exactSearchAudio(this.searchAudio).then(validData => {
        //console.log('validData=', validData)
        this.list = validData
        this.mmLoadShow = false
        if (this.list.length === 0) {
          this.$mmToast('没有搜索到合适的, 请更换关键词试试. 或查看原歌曲时长是否正确')
        }
      })
    }
    this.setSearchAudio(null)
  },
  methods: {
    // 精确搜索(根据正版歌曲的duration过滤搜索)
    /*
      还可以进行优化:
    1. 为搜索结果添加音质. 由于搜索音质的接口需要发2个请求, 所以暂时不实现了. 免得请求次数太多.
     但是这个功能可以加到"为歌单添加音源"中, 否则用户一个一个查看音源音质太费事
    2. 关键词上, 可以做文章, 看除了'hi-res'还能添加什么关键词
     */
    async exactSearchAudio(reference, checkoutDuration = true) {
      // //console.log("targetDuration=", targetDuration)
      const desiredDataCount = 8;
      const maxReq = 3 //最多查询次数
      const validData = []
      let page = 1;
      while (validData.length < desiredDataCount && page <= maxReq) {
        try {
          const data = await searchBili(this.searchValue, page);
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
                originDuration: reference.originDuration, //歌曲真实时长,也就是正版的时长, complex中的duration用于表示找到的音频的时长
                mixInfo: {audioSourceFrom: 'bili', others: reference.platform},
              }
              item.complex = complex
              //@TODO 有重复bvid, 按道理来说,分页查询重复可能性不大. 暂时不管这个bug
              validData.push(item)
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
    ...mapMutations({setSearchAudio: 'SET_SEARCH_AUDIO'}),
    // 播放歌曲
    selectItem(video) {
      let axiosReq = null
      try {
        if (video.complex) {
          //console.log('toCreateComplexSong')
          //console.log(video)
          axiosReq = createComplexSong(video)
        } else {
          axiosReq = createBiliSong(video)
        }
        axiosReq.then(song => {
          //console.log('song')
          //console.log(song)
          this.selectAddPlay(song)
        })
      } catch (error) {
        this.$mmToast('播放b站歌曲，出错啦~')
      }
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
    // 普通搜索,仅用关键字,不过滤搜索结果
    searchVideo() {
      searchBili(this.searchValue, '1')
        .then((data) => {
          data.data.result.forEach(item => {
            item.title = item.title.replace(/<em class="keyword">|<\/em>/g, '')
          })
          ////console.log("res=", data)
          this.list = data.data.result
          this.mmLoadShow = false
        }).catch((err) => {
        this.$mmToast('network error: ', err)
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
