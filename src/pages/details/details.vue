<template>
  <!--歌单详情-->
  <div class="details">

    <mm-loading v-model="mmLoadShow"/>
    <music-list v-if="platform === 'custom'" list-type="customListDetails" :list="list" @select="selectItem"
                @del="deleteItem">
      <div v-if="!bindAudio" slot="listBtnHead" class="list-btn">
        <span @click="bindSongsAudio">绑定歌单中的vip歌曲</span>
      </div>
      <div v-if="!bindAudio" slot="listBtn" class="list-btn">
        <span @click="$refs.dialog.show()">清空列表</span>
      </div>
    </music-list>
    <music-list v-else-if="platform === 'netease'" list-type="neteaseListDetails" :list="list" @select="selectItem">
      <div v-if="!bindAudio" slot="listBtnHead" class="list-btn">
        <span @click="bindSongsAudio">绑定歌单中的vip歌曲</span>
      </div>
    </music-list>
    <music-list v-else-if="platform === 'qq' && !bindAudio" list-type="qqListDetails" :list="list" @select="selectItem"
                @pullUp="pullUpLoadQQList">
      <div v-if="!bindAudio" slot="listBtnHead" class="list-btn">
<!--        <span @click="bindSongsAudio">绑定歌单中的vip歌曲</span>-->
        <span @click="bindSongsAudio">绑定歌单中的vip歌曲</span>
      </div>
    </music-list>
    <music-list v-else-if="platform === 'qq' && bindAudio" :bind-audio="bindAudio" list-type="qqListDetails"
                :list="list" :songs-audio-candidates="songsAudioCandidates" @select="selectItem"></music-list>
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
import {getPlaylistDetailNeteaseSpider, getQQMusicListDetail, searchBili} from 'api/index'
import MmLoading from 'base/mm-loading/mm-loading'
import {loadMixin} from '@/utils/mixin'
import MmDialog from 'base/mm-dialog/mm-dialog'
import MusicList from 'components/music-list/music-list'
import {getCustomList, removeSongFromCustomList} from "@/utils/storage";
import {formatSongs} from "@/utils/createSongQQ";
import {createComplexSong} from "@/utils/createComplexSong";

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
      qqListCount: 0, //qqList是分段加载, 这里记录总数量
      qqListPage: 0,
      qqListPageCount: 30, //qq歌单每页加载数量
      bindAudio: false,
    }
  },
  computed: {
    ...mapGetters(
      [
        'songsAudioCandidates',
        'musicListMap',
      ])
  },
  created() {
    //console.log('created!!!!!!!!!!')
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
        document.title = this.platform + ' - ' + data.req_0.data.dirinfo.title
        // //console.log('data====')
        // //console.log(data)
        this.list = formatSongs(data.req_0.data.songlist)
        this._hideLoad()
      })
      // 统计vip歌曲数量
      /*getQQMusicListDetail(this.songListId, 0, 950).then(data => {
        this.qqListCount = data.req_0.data.total_song_num
        //console.log('this.qqListCount=', this.qqListCount)
        let count = 0;
        data.req_0.data.songlist.forEach(music => {
          if (parseInt(music.pay.pay_play)) {
            count++
          }
        })
        //console.log('count=', count)
        // this.list = formatSongs(data.req_0.data.songlist)
        this._hideLoad()
      })*/
    }
  },
  beforeDestroy() {
    //console.log(' -- details 组件 --- 死了')
  },
  methods: {
    bindSongsAudio() {
      this.$router.push({
        name: 'BindSongsAudio',
        params: {
          platform: this.$route.params.platform,
          id: this.$route.params.id
        }
      })
    },
    /*bindSongsAudio_Origin() {
      this.list = []
      if (this.platform === 'qq') {
        //console.log('qq bind')

        this.pullUpLoadQQVipSongs(3, true)
      } else {
        //console.log('other bind')
      }
      this.$nextTick(() => {
        this.bindAudio = true
      })
    },
    pullUpLoadQQVipSongs(count = 3, start = false) {
      if (!start) this.qqListPage++
      //console.log('!!!!!!!!!!! pullUpLoadQQVipSongs')
      const vipSongs = []
      let qqSongs = []
      const qqSongCandidates = []
      getQQMusicListDetail(this.songListId, this.qqListPage * this.qqListPageCount, this.qqListPageCount).then(data => {
        if (data.req_0.data.songlist.length === 0) {
          this.$mmToast('歌单中没有更多歌曲了！')
          return
        }
        data.req_0.data.songlist.forEach(music => {
          if (parseInt(music.pay.pay_play))
            vipSongs.push(music)
        })
        //console.log('vipSongs.length', vipSongs.length)
        qqSongs = formatSongs(vipSongs)
        //console.log('before qqSongs=', qqSongs)
        for (let j = 0; j < qqSongs.length; j++) {
          if (j > 2) {
            break
          }
          this.exactSearchAudio(qqSongs[j], true).then(candidates => {
            //qqSongs[j].audioSources = candidates

            qqSongCandidates[j] = candidates
            qqSongCandidates[j].unshift(qqSongs[j])
            // //console.log(data)
          })
        }
      }).then(() => {
        this.list = [...this.list, ...qqSongs]
        //if (this.songsAudioCandidates === []) {
          ////console.log('empty')
          // this.songsAudioCandidates = qqSongCandidates
          this.setSongsAudioCandidates(qqSongCandidates)
       // } else
         // this.songsAudioCandidates = [...this.songsAudioCandidates, ...qqSongCandidates]
        //console.log('after this.list=', this.list)
        //console.log('after this.songsAudioCandidates=', this.songsAudioCandidates)
        //console.log('after qqSongCandidates=', qqSongCandidates)

        if (count - vipSongs.length > 0) {
          //this.pullUpLoadQQVipSongs(count - vipSongs.length)
        }
      })
    },
    async exactSearchAudio(reference, checkoutDuration = true) {
      const keyword = reference.name + ' ' + reference.singer
      const desiredDataCount = 3;
      const maxReq = 1 //最多查询次数
      const validData = []
      let page = 1;
      while (validData.length < desiredDataCount && page <= maxReq) {
        try {
          const data = await searchBili(keyword, page);
          const list = data.data.result;

          for (let i = 0; i < list.length && i < desiredDataCount; i++) {
            const durationFormat = list[i].duration.split(':') //视频duration最小单位是秒, 匹配歌词的话可能有误差
            const minute = parseInt(durationFormat[0])
            const second = parseInt(durationFormat[1])
            const duration = (minute * 60 + second)
            if (!checkoutDuration || Math.abs(duration - reference.originDuration) <= 4) {
              list[i].title = list[i].title.replace(/<em class="keyword">|<\/em>/g, '')
              list[i].lyricSource = {platform: reference.platform, songId: reference.id}
              const complex = {
                id: reference.id + '-' + list[i].bvid,
                name: reference.name,
                subTitle: reference.subTitle,
                singer: reference.singer,
                album: reference.album,
                image: reference.image,
                originDuration: duration,
                mixInfo: {audioSourceFrom: 'bili', others: reference.platform},
              }
              list[i].complex = complex
              //@TODO 有重复bvid, 按道理来说,分页查询重复可能性不大. 暂时不管这个bug
              createComplexSong(list[i]).then((complexSong) => {
                validData.push(complexSong)
              })
            }
          }
          /!*list.forEach(item => {
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
                originDuration: item.duration,
                mixInfo: {audioSourceFrom: 'bili', others: reference.platform},
              }
              item.complex = complex
              //@TODO 有重复bvid, 按道理来说,分页查询重复可能性不大. 暂时不管这个bug
              createComplexSong(item).then((complexSong) => {
                validData.push(complexSong)
              })
            }
          })*!/
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
    },*/
    pullUpLoadQQList() {
      this.qqListPage++
      //console.log('pullUpLoadQQList!!!!!!!!')
      getQQMusicListDetail(this.songListId, this.qqListPage * this.qqListPageCount, this.qqListPageCount).then(data => {
        if (data.req_0.data.songlist.length === 0) {
          this.$mmToast('歌单中没有更多歌曲了！')
          return
        }
        //console.log(data)
        this.list = [...this.list, ...formatSongs(data.req_0.data.songlist)]
      })
    },
    delCustomList() {
      this.delMusicList({platform: this.platform, id: this.songListId})
      this.$router.push('/music/userList')
    },
    deleteItem(index) {
      // //console.log('deleteItem, index=', index)
      // //console.log("this.songListId", this.songListId)
      if (this.list.length === 1) {
        this.delCustomList()
      } else {
        this.list.splice(index, 1)
        // //console.log("del res=", this.list)
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
      setSongsAudioCandidates: 'SET_SONGS_AUDIO_CANDIDATES',
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
