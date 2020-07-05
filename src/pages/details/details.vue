<template>
  <!--歌单详情-->
  <div class="details">
    <mm-loading v-model="mmLoadShow" />
    <music-list :list="list" @select="selectItem" />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { getPlaylistDetail, getMusicDetail } from 'api'
import MmLoading from 'base/mm-loading/mm-loading'
import MusicList from 'components/music-list/music-list'
import { formatTopSongs } from '@/utils/song'
import { loadMixin } from '@/utils/mixin'

export default {
  name: 'Detail',
  components: {
    MmLoading,
    MusicList
  },
  mixins: [loadMixin],
  data() {
    return {
      list: [] // 列表
    }
  },
  created() {
    // 获取歌单详情
    getPlaylistDetail(this.$route.params.id).then(({ playlist }) => {
      document.title = `${playlist.name} - mmPlayer在线音乐播放器`
      const ids = playlist.trackIds.map(v => v.id).toString()
      getMusicDetail(ids).then(({ songs }) => {
        this.list = formatTopSongs(songs)
        this._hideLoad()
      })
    })
  },
  methods: {
    // 播放暂停事件
    selectItem(item, index) {
      this.selectPlay({
        list: this.list,
        index
      })
    },
    ...mapActions(['selectPlay'])
  }
}
</script>

<style lang="less" scoped>
.details {
  position: relative;
  width: 100%;
  height: 100%;
  .musicList {
    width: 100%;
    height: 100%;
  }
}
</style>
