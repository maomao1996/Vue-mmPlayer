<template>
  <!--歌单详情-->
  <div class="details">

    <mm-loading v-model="mmLoadShow" />
    <music-list list-type="listDetails" :list="list" @select="selectItem"
                @del="deleteItem">
      <div slot="listBtn" class="list-btn">
        <span @click="$refs.dialog.show()">清空列表</span>
      </div>
    </music-list>
    <mm-dialog
      ref="dialog"
      body-text="删除歌单"
      confirm-btn-text="删除"
      @confirm="delCustomList"
    />
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import { getPlaylistDetailNeteaseSpider } from 'api/index'
import MmLoading from 'base/mm-loading/mm-loading'
import { loadMixin } from '@/utils/mixin'
import MmDialog from 'base/mm-dialog/mm-dialog'
import MusicList from 'components/music-list/music-list'

export default {
  name: 'Detail',
  components: {
    MmLoading,
    MusicList,
    MmDialog,
  },
  mixins: [loadMixin],
  data() {
    return {
      songListId: this.$route.params.id,
      platform: this.$route.params.platform,
      list: [], // 列表
    }
  },
  computed: {
    ...mapGetters(
      [
      'customMusicList',
      'manageCustomMusicListRes',
      'musicListMap',
    ])
  },
  created() {
    document.title = '无名歌单'
    if (this.platform === 'custom') {
      for (let i = 0; i < this.musicListMap.length; i++) {
        if (this.musicListMap[i].id === parseInt(this.songListId)) {
          document.title = this.platform + ' - ' + this.musicListMap[i].listName
          break
        }
      }
      this.setCustomMusicListId(this.songListId)
      // console.log('this.customMusicList', this.customMusicList)
      this.list = this.customMusicList
      this._hideLoad()
    } else if (this.platform === 'netease') {
      getPlaylistDetailNeteaseSpider(this.$route.params.id)
        .then((playlist) => {
          document.title = this.platform + ' - ' + playlist.name
          this.list = playlist.tracks
          this._hideLoad()
        })
        .catch(() => {
          this._hideLoad()
        })
    }
  },
  beforeDestroy() {
    console.log(' -- details 组件 --- 死了')
  },
  methods: {
    delCustomList() {
      this.delCustomMusicList(this.songListId)
      this.$router.push('/music/userList')
      this.$mmToast(this.manageCustomMusicListRes)
    },
    deleteItem(index) {
      console.log('deleteItem, index=', index)
      console.log("this.songListId", this.songListId)
      if (this.list.length === 1) {
        console.log('12312313')
        this.delCustomMusicList(this.songListId)
        this.$router.push('/music/userList')
      }
      else {
        this.list.splice(index, 1)
        console.log("del res=", this.list)
        this.delSongFromCustomMusicListById({id:this.songListId, newList: this.list})
      }
      this.$mmToast(this.manageCustomMusicListRes)
    },
    // 播放暂停事件
    selectItem(item, index) {
      this.selectPlay({
        list: this.list,
        index,
      })
    },
    ...mapActions([
      'selectPlay',
      'setCustomMusicListId',
      'delSongFromCustomMusicListById',
      'delCustomMusicList'
    ]),
  },
}
</script>

<style lang="less" scoped>
.details {
  .music-list {
    height: 100%;
  }
}
</style>
