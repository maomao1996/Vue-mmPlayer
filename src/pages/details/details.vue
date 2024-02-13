<template>
  <!--歌单详情-->
  <div class="details">

    <mm-loading v-model="mmLoadShow" />
    <music-list v-if="platform === 'custom'" list-type="customListDetails" :list="list" @select="selectItem"
                @del="deleteItem">
      <div slot="listBtn" class="list-btn">
        <span @click="$refs.dialog.show()">清空列表</span>
      </div>
    </music-list>
    <music-list v-else list-type="listDetails" :list="list" @select="selectItem"/>
    <mm-dialog
      ref="dialog"
      body-text="删除歌单"
      confirm-btn-text="删除"
      @confirm="delCustomList"
    />
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from 'vuex'
import {getPlaylistDetailNeteaseSpider, getQQMusicListDetail} from 'api/index'
import MmLoading from 'base/mm-loading/mm-loading'
import { loadMixin } from '@/utils/mixin'
import MmDialog from 'base/mm-dialog/mm-dialog'
import MusicList from 'components/music-list/music-list'
import {getCustomList, removeSongFromCustomList} from "@/utils/storage";

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
      'musicListMap',
    ])
  },
  created() {
    console.log('created!!!!!!!!!!')
    document.title = '无名歌单'
    if (this.platform === 'custom') {
      for (let i = 0; i < this.musicListMap.length; i++) {
        if (this.musicListMap[i].id === parseInt(this.songListId)) {
          document.title = this.platform + ' - ' + this.musicListMap[i].listName
          break
        }
      }
      this.list = getCustomList(this.songListId)
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
    } else if (this.platform === 'qq') {
      getQQMusicListDetail(this.songListId).then(data => {
        console.log(data)
        this._hideLoad()
      })
    }
  },
  beforeDestroy() {
    console.log(' -- details 组件 --- 死了')
  },
  methods: {
    delCustomList() {
      this.delMusicList({platform: this.platform, id: this.songListId})
      this.$router.push('/music/userList')
    },
    deleteItem(index) {
      // console.log('deleteItem, index=', index)
      // console.log("this.songListId", this.songListId)
      if (this.list.length === 1) {
       this.delCustomList()
      }
      else {
        this.list.splice(index, 1)
        // console.log("del res=", this.list)
        removeSongFromCustomList(this.songListId, this.list)
      }
      this.list = getCustomList(this.songListId)
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
    ]),
    ...mapMutations({
      delMusicList: 'DEL_MUSIC_LIST',
    })
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
