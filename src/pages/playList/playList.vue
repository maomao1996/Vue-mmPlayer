<template>
  <!--正在播放-->
  <div class="playList">
    <music-list
      :list="playlist"
      :list-type="1"
      @select="selectItem"
      @del="deleteItem"
    >
      <div slot="listBtn" class="list-btn">
        <span @click="$refs.dialog.show()">清空列表</span>
      </div>
    </music-list>
    <mm-dialog
      ref="dialog"
      body-text="是否清空正在播放列表"
      confirm-btn-text="清空"
      @confirm="clearList"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import MusicList from 'components/music-list/music-list'
import MmDialog from 'base/mm-dialog/mm-dialog'

export default {
  name: 'PlayList',
  components: {
    MusicList,
    MmDialog
  },
  data() {
    return {
      show: false
    }
  },
  computed: {
    ...mapGetters(['playing', 'playlist', 'currentMusic'])
  },
  methods: {
    // 清空列表事件
    clearList() {
      this.clearPlayList()
      this.$mmToast('列表清空成功')
    },
    // 播放暂停事件
    selectItem(item, index) {
      if (item.id !== this.currentMusic.id) {
        this.setCurrentIndex(index)
        this.setPlaying(true)
      }
    },
    // 删除事件
    deleteItem(index) {
      let list = [...this.playlist]
      list.splice(index, 1)
      this.removerPlayListItem({ list, index })
      this.$mmToast('删除成功')
    },
    ...mapMutations({
      setPlaying: 'SET_PLAYING',
      setCurrentIndex: 'SET_CURRENTINDEX',
      clearPlaylist: 'CLEAR_PLAYLIST'
    }),
    ...mapActions(['removerPlayListItem', 'clearPlayList'])
  }
}
</script>

<style lang="less">
.playList {
  position: relative;
  width: 100%;
  height: 100%;
  .musicList {
    width: 100%;
    height: 100%;
    .list-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 50px;
      span {
        padding: 5px 20px;
        cursor: pointer;
        user-select: none;
        &:hover {
          color: @text_color_active;
        }
      }
    }
  }
}
</style>
