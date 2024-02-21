<template>
  <!--搜索-->
  <div class="search flex-col">
    <mm-loading v-model="mmLoadShow"/>
    <div class="search-head">
      <span v-for="(item, index) in Artists" :key="index" @click="clickHot(item.first)">
        {{ item.first }}
      </span>
      <input
        v-model.trim="searchValue"
        class="search-input"
        type="text"
        placeholder="音乐/歌手"
        @keyup.enter="onEnter"
      />
    </div>
    <div class="flex-1 overflow-hidden">
      <music-list
        ref="musicList"
        :list="list"
        list-type="search"
        @select="selectItem"
        @pullUp="pullUpLoad"
        @searchAudio="searchAudio"
      />
    </div>

    <!--持有bvid, 主动绑定到某首音乐-->
    <mm-dialog
      ref="bindBvidDialog"
      head-text="绑定已知bvid"
      confirm-btn-text="绑定"
      cancel-btn-text="自动搜索音频"
      @confirm="bindBvid"
      @cancel="defaultExactSearch"
    >
      <div class="mm-dialog-text">
        <input
          v-model.trim="hasBvid"
          class="mm-dialog-input"
          autofocus
          placeholder="请输入您找到的bvid"
          @keyup.enter="bindBvid"
        />
      </div>
      <div slot="btn" @click="openDialog(1)">帮助</div>
      <div slot="btn2" @click="openDialog(2)">取消</div>
    </mm-dialog>
    <!--绑定bvid帮助-->
    <mm-dialog
      ref="helpDialog"
      head-text="绑定bvid帮助"
      confirm-btn-text="绑定"
      cancel-btn-text="取消"
      @confirm="openDialog(0)"
    >
      <div class="mm-dialog-text">
        <p>
          1、
          <a target="_blank" href="https://music.163.com">点我(https://music.163.com)</a>
          打开b站官网搜索bvid或当前网站的b站接口中搜索
        </p>
        <p>2、输入b站bvid</p>
      </div>
    </mm-dialog>
  </div>
</template>

<script>
import {mapGetters, mapActions, mapMutations} from 'vuex'
import {searchQQ, searchNetease, searchHot, getMusicDetail} from 'api/index'
import {formatSongs as formatQQSongs} from '@/utils/createSongQQ'
import {formatSongs as formatNeteaseSongs} from '@/utils/createSongNetease'
import MmLoading from 'base/mm-loading/mm-loading'
import {loadMixin} from '@/utils/mixin'
import {toHttps} from '@/utils/util'
import MmDialog from 'base/mm-dialog/mm-dialog'
import MusicList from 'components/music-list/music-list'
export default {
  name: 'Search',
  components: {
    MmLoading,
    MusicList,
    MmDialog,
  },
  mixins: [loadMixin],
  data() {
    return {
      hasBvid: '',
      searchValue: '孙燕姿', // 搜索关键词
      Artists: [], // 热搜数组
      list: [], // 搜索数组
      page: 0, // 分页
      lockUp: true, // 是否锁定上拉加载事件,默认锁定
      musicInfo: null,
    }
  },
  computed: {
    ...mapGetters(['playing', 'currentMusic']),
  },
  watch: {
    list(newList, oldList) {
      if (newList.length !== oldList.length) {
        this.lockUp = false
      } else if (newList[newList.length - 1].id !== oldList[oldList.length - 1].id) {
        this.lockUp = false
      }
    },
  },
  created() {
    // 获取热搜
    searchHot().then(({result}) => {
      this.Artists = result.hots.slice(0, 5)
      this.mmLoadShow = false
    })
    this.onEnter()
  },
  methods: {
    // 打开对话框
    openDialog(key) {
      switch (key) {
        case 0:
          this.$refs.bindBvidDialog.show()
          break
        case 1:
          this.$refs.bindBvidDialog.hide()
          this.$refs.helpDialog.show()
          break
        case 2:
          this.$refs.bindBvidDialog.hide()
          break
      }
    },
    bindBvid() {
      if (!this.hasBvid) {
        this.$mmToast('没有bvid,启动自动搜索')
      }
      //console.log('this.musicInfo', this.musicInfo)
      if (this.musicInfo.platform === 'netease') {
        // 添加封面url
        getMusicDetail(this.musicInfo.id).then((res) => {
          this.musicInfo.image = res.songs[0].al.picUrl
        }).then(() => {
          this.musicInfo.audioSource = {tryBind: this.hasBvid}
          this.setSearchAudio(this.musicInfo)
          this.$router.push({
            name: 'bili-search',
          })
        })
      } else {
        this.musicInfo.audioSource = {tryBind: this.hasBvid}
        this.setSearchAudio(this.musicInfo)
        this.$router.push({
          name: 'bili-search',
        })
      }
    },
    defaultExactSearch() {
      this.setSearchAudio(this.musicInfo)
      this.$router.push({
        name: 'bili-search',
      })
    },
    // 搜索音频
    searchAudio(music) {
      this.musicInfo = music
      //console.log("this.musicInfo=", this.musicInfo)
      this.openDialog(0)
    },
    // 点击热搜
    clickHot(name) {
      this.searchValue = name
      this.onEnter()
    },
    // 搜索事件
    onEnter() {
      if (this.searchValue.replace(/(^\s+)|(\s+$)/g, '') === '') {
        this.$mmToast('搜索内容不能为空！')
        return
      }
      this.mmLoadShow = true
      this.page = 0
      if (this.list.length > 0) {
        this.$refs.musicList.scrollTo()
      }
      const queryNetease = searchNetease(this.searchValue).then(({result}) => {
        return formatNeteaseSongs(result.songs)
      })
      const queryQQ = searchQQ(this.searchValue).then(data => {
        //console.log("searchQQ")
        //console.log(data.req_0.data.body.song.list)
        /*return formatQQSongs_WithUrl(data.req_0.data.body.song.list).then(result => {
          //console.log("result=", result)
          return result
        })*/
        return formatQQSongs(data.req_0.data.body.song.list)
      })
      Promise.all([queryNetease, queryQQ]).then(([neteaseRes, qqRes]) => {
        //console.log("neteaseRes=", neteaseRes)
        //console.log("qqRes=", qqRes)
        const mergeArray = []
        const maxLen = Math.max(neteaseRes.length, qqRes.length)
        for (let i = 0; i < maxLen; i++) {
          if (i < neteaseRes.length) {
            mergeArray.push(neteaseRes[i])
          }
          if (i < qqRes.length) {
            mergeArray.push(qqRes[i])
          }
        }
        this.list = mergeArray
        this._hideLoad()
      })

    },
    // 滚动加载事件
    pullUpLoad() {
      this.page += 1
      searchNetease(this.searchValue, this.page).then(({result}) => {
        if (!result.songs) {
          this.$mmToast('没有更多歌曲啦！')
          return
        }
        this.list = [...this.list, ...formatNeteaseSongs(result.songs)]
      })
    },
    // 播放歌曲
    async selectItem(music) {
      // //console.log(music)
      try {
        if (music.platform === 'netease') {
          const image = await this._getMusicDetail(music.id)
          music.image = toHttps(image)
        }
        this.selectAddPlay(music)
      } catch (error) {
        this.$mmToast('哎呀，出错啦~')
      }
    },
    // 获取歌曲详情
    _getMusicDetail(id) {
      return getMusicDetail(id).then((res) => res.songs[0].al.picUrl)
    },
    ...mapMutations({
      setPlaying: 'SET_PLAYING',
      setSearchAudio: 'SET_SEARCH_AUDIO'
    }),
    ...mapActions(['selectAddPlay']),
  },
}
</script>

<style lang="less" scoped>
.search {
  overflow: hidden;
  height: 100%;

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
}
</style>
