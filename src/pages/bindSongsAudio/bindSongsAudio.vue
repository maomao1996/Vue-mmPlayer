<template>
  <!--歌单详情-->
  <div class="details">

    <mm-loading v-model="mmLoadShow" />
    <music-list v-if="platform === 'custom'" list-type="customListDetails" :list="list" @select="selectItem"
                @del="deleteItem">
    </music-list>
    <music-list v-else-if="platform === 'netease'" list-type="neteaseListDetails" :list="list" @select="selectItem">
    </music-list>
    <music-list v-else list-type="qqListDetails" :list="list" @select="selectItem" @pullUp="pullUpLoadQQList">
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
import {mapActions, mapGetters, mapMutations} from 'vuex'
import {getPlaylistDetailNeteaseSpider, getQQMusicListDetail} from 'api/index'
import MmLoading from 'base/mm-loading/mm-loading'
import { loadMixin } from '@/utils/mixin'
import MmDialog from 'base/mm-dialog/mm-dialog'
import MusicList from 'components/music-list/music-list'
import {getCustomList, removeSongFromCustomList} from "@/utils/storage";
import {formatSongs} from "@/utils/createSongQQ";

export default {
  name: 'bindSongsAudio',
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
      qqListCount: 0, //qqList是分段加载, 这里记录总数量
      qqListPage: 0,
      qqListPageCount: 30, //qq歌单每页加载数量
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
      getQQMusicListDetail(this.songListId, this.qqListPage, this.qqListPageCount).then(data => {
        this.qqListCount = data.req_0.data.total_song_num
        // console.log(data)
        this.list = formatSongs(data.req_0.data.songlist)
        this._hideLoad()
      })
      // 统计vip歌曲数量
      /*getQQMusicListDetail(this.songListId, 0, 950).then(data => {
        this.qqListCount = data.req_0.data.total_song_num
        console.log('this.qqListCount=', this.qqListCount)
        let count = 0;
        data.req_0.data.songlist.forEach(music => {
          if (parseInt(music.pay.pay_play)) {
            count++
          }
        })
        console.log('count=', count)
        // this.list = formatSongs(data.req_0.data.songlist)
        this._hideLoad()
      })*/
    }
  },
  beforeDestroy() {
    console.log(' -- details 组件 --- 死了')
  },
  methods: {
    bindSongsAudio() {
      if (this.platform === 'qq') {

      } else {

      }
    },
    pullUpLoadQQList() {
      this.qqListPage++
      console.log('pullUpLoadQQList!!!!!!!!')
      getQQMusicListDetail(this.songListId, this.qqListPage * this.qqListPageCount, this.qqListPageCount).then(data => {
        if (data.req_0.data.songlist.length === 0) {
          this.$mmToast('歌单中没有更多歌曲了！')
          return
        }
        console.log(data)
        this.list = [...this.list, ...formatSongs(data.req_0.data.songlist)]
      })
    },
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
