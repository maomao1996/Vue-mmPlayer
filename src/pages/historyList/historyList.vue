<template>
  <!--我听过的（播放历史）-->
  <div class="historyList">
    <music-list
      :list="historyList"
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
      body-text="是否清空播放历史列表"
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
  name: 'HistoryList',
  components: {
    MusicList,
    MmDialog
  },
  computed: {
    ...mapGetters(['historyList', 'playing', 'currentMusic'])
  },
  methods: {
    // 清空列表事件
    clearList() {
      this.clearHistory()
      this.$mmToast('列表清空成功')
    },
    // 播放事件
    selectItem(item, index) {
      this.selectPlay({
        list: this.historyList,
        index
      })
    },
    // 删除事件
    deleteItem(index) {
      let list = [...this.historyList]
      list.splice(index, 1)
      this.removeHistory(list)
      this.$mmToast('删除成功')
    },
    ...mapMutations({
      setPlaying: 'SET_PLAYING'
    }),
    ...mapActions(['selectPlay', 'clearHistory', 'removeHistory'])
  }
}
</script>

<style lang="less" scoped>
.historyList {
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
