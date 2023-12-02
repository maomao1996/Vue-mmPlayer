<template>
  <!--搜索-->
  <div class="search flex-col">
    <mm-loading v-model="mmLoadShow" />
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
        list-type="pullup"
        @select="selectItem"
        @pullUp="pullUpLoad"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { search, searchHot, getMusicDetail } from 'api'
import { formatSongs } from '@/utils/song'
import MmLoading from 'base/mm-loading/mm-loading'
import MusicList from 'components/music-list/music-list'
import { loadMixin } from '@/utils/mixin'
import { toHttps } from '@/utils/util'

export default {
  name: 'Search',
  components: {
    MmLoading,
    MusicList,
  },
  mixins: [loadMixin],
  data() {
    return {
      searchValue: '', // 搜索关键词
      Artists: [], // 热搜数组
      list: [], // 搜索数组
      page: 0, // 分页
      lockUp: true, // 是否锁定上拉加载事件,默认锁定
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
    searchHot().then(({ result }) => {
      this.Artists = result.hots.slice(0, 5)
      this.mmLoadShow = false
    })
  },
  methods: {
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
      search(this.searchValue).then(({ result }) => {
        this.list = formatSongs(result.songs)
        this._hideLoad()
      })
    },
    // 滚动加载事件
    pullUpLoad() {
      this.page += 1
      search(this.searchValue, this.page).then(({ result }) => {
        if (!result.songs) {
          this.$mmToast('没有更多歌曲啦！')
          return
        }
        this.list = [...this.list, ...formatSongs(result.songs)]
      })
    },
    // 播放歌曲
    async selectItem(music) {
      try {
        const image = await this._getMusicDetail(music.id)
        music.image = toHttps(image)
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
