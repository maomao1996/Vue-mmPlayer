<template>
  <!--歌单详情-->
  <div class="details">
    <mm-loading v-model="mmLoadShow"/>
    <div class="music-list flex-col">
      <template v-if="list.length > 0">
        <div class="list-item list-header">
          <!--@TODO 样式有问题-->
          <span class="list-platform">平台</span>
          <span class="list-num">序号</span>
          <span class="list-name">歌曲</span>
          <span class="list-artist">歌手</span>
          <span class="list-origin-time">原版时长</span>
          <span class="list-album">专辑</span>
          <span class="list-name">绑定</span>
        </div>

        <div ref="listContent" class="list-content">
          <!-- @TODO 这里每个item都绑定了事件. 可以用事件委派来优化 -->
          <div
            v-for="(item, index) in list"
            :key="item.id"
            class="list-item"
          >
            <span class="list-platform" v-text="item.platform"></span>
            <span class="list-num" v-text="index + 1"></span>
            <!--歌名+播放/暂停-->
            <div class="list-name">
              <span>{{ item.name + (item.subTitle ? ' >> ' + item.subTitle : '') }}</span>
              <!-- <div class="list-menu-icon-play">
               <mm-icon
                  class="hover"
                  :type="getPlayIconType(item)"
                  :size="40"
                  @click.stop="selectItem(item, index)"
                />
              </div>-->
            </div>
            <!-- 歌手+添加歌单按钮 -->
            <span class="list-artist">{{ item.singer }}</span>
            <!--真实时长+搜索音源按钮-->
            <span class="list-origin-time">{{ item.originDuration % 3600 | format }}</span>
            <!-- 专辑+删除歌曲按钮 -->
            <span class="list-album">
            {{ item.album }}</span>
            <!--操作绑定音频-->
            <div class="list-bind">
              <!--<span>{{ item.name + (item.subTitle ? ' >> ' + item.subTitle : '') }}</span>-->
              <el-switch
                v-model="chosenChecked[index]"
                :disabled="chosenChecked[index]"
                @change="confirmBind(index)"
                active-color="#13ce66"
                inactive-color="#ff4949">
              </el-switch>
              <el-select @change="testAudio(index)" :disabled="chosenChecked[index]" clearable
                         v-model="chosenAudio[index]" placeholder="请选择">
                <el-option
                  v-for="(candidate,i) in songsAudioCandidates[index]"
                  :key="i"
                  :label="candidate.platform === 'complex' ? 'bili-' + candidate.audioSource.bvid : '原音频'"
                  :value="i">
                </el-option>
              </el-select>
            </div>
          </div>
        </div>
      </template>
      <mm-no-result v-else title="没有需要绑定的vip歌曲"/>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from 'vuex'
import {getPlaylistDetailNeteaseSpider, getQQMusicListDetail, searchBili} from 'api/index'
import MmLoading from 'base/mm-loading/mm-loading'
import {loadMixin} from '@/utils/mixin'
import MmDialog from 'base/mm-dialog/mm-dialog'
import MusicList from 'components/music-list/music-list'
import MmNoResult from 'base/mm-no-result/mm-no-result'
import {addBindInfo, getCustomList, removeSongFromCustomList} from "@/utils/storage";
import {formatSongs} from "@/utils/createSongQQ";
import {createComplexSong} from "@/utils/createComplexSong";
import {format, toHttps} from "@/utils/util";
import Vue from "vue";

export default {
  name: 'BindSongsAudio',
  components: {
    MmLoading,
    MusicList,
    MmDialog,
    MmNoResult,
  },
  filters: {
    format,
  },
  mixins: [loadMixin],
  data() {
    return {
      songListId: this.$route.params.id,
      platform: this.$route.params.platform,
      list: [], // 列表
      qqListCount: 0, //qqList是分段加载, 这里记录总数量
      qqListPage: 0,
      qqListPageCount: 5, //qq歌单每页加载数量
      songsAudioCandidates: [],
      chosenAudio: [],
      chosenChecked: [],
      lockUp: true,
      checkedCount: 0,
      loadAudioCount: 3,
      onceLoadVipSongsPage: 0,
      //neteaseVipSongs: [],
      onceLoadVipSongs: [],
    }
  },
  computed: {
    ...mapGetters(
      [
        'musicListMap',
      ])
  },
  watch: {
    list(newList, oldList) {
      // if (this.listType !== 'search') {
      /*if (this.listType !== 'search' && this.listType !== 'qqListDetails') {
        return
      }*/
      if (newList.length !== oldList.length) {
        this.lockUp = false
      }
      /* else if (newList[newList.length - 1].id !== oldList[oldList.length - 1].id) {
         this.lockUp = false
       }*/
      for (let i = 0; i < newList.length - oldList.length; i++) {
        this.chosenChecked.push(false)
      }
    },
    /*songsAudioCandidates(newList, oldList) {
      //console.log('songsAudioCandidates//////////')
      //console.log('songsAudioCandidates==', this.songsAudioCandidates)

      // if (oldList.length ===0) this.songsAudioCandidates.unshift([12, 134,1342])
    },*/
    /*chosenChecked(newList, oldList){
      for (let i = 0; i < newList; i++) {
        if (newList[i] !== oldList && newList[i]) {
          // 确认绑定
          //console.log('checkedChosen i===', i)
          this.checkedCount++
          //console.log('newList.length===', newList.length)
          if (this.checkedCount === newList.length) {
            //console.log('绑定剩余部分')
          }
        } else {
          // 取消确认
          //console.log('取消不了, 已经绑定了. 需要重新绑定, 请单独绑定该歌曲. 教程看"单只歌曲绑定"')
        }
      }
    }*/
  },
  created() {
    // this.mmLoadShow = true
    //console.log('created!!!!!!!!!!')
    document.title = '无名歌单'
    if (this.platform === 'custom') {
      for (let i = 0; i < this.musicListMap.length; i++) {
        if (this.musicListMap[i].id === parseInt(this.songListId)) {
          document.title = this.platform + ' - ' + this.musicListMap[i].listName
          break
        }
      }
      const songList = getCustomList(this.songListId)
      //console.log('this._hideLoad() getCustomList')
      const vipSongs = []
      songList.forEach(song => {
        if (song.limit !== 0 && song.limit !== 8) {
          vipSongs.push(song)
        }
      })
      this.onceLoadVipSongs = vipSongs
      const partSongs = this.onceLoadVipSongs.slice(this.loadAudioCount * (this.onceLoadVipSongsPage++), this.loadAudioCount)
      this.searchSongsAudio(partSongs).then(() => {
        this.list = [...this.list, ...partSongs]
        //console.log('after this.list=', this.list)
        this._hideLoad()
      })
    } else if (this.platform === 'netease') {
      getPlaylistDetailNeteaseSpider(this.$route.params.id)
        .then((playlist) => {
          document.title = this.platform + ' - ' + playlist.name
          //this.list = playlist.tracks
          const vipSongs = []
          playlist.tracks.forEach(song => {
            if (song.limit !== 0 && song.limit !== 8) {
              vipSongs.push(song)
            }
          })
          this.onceLoadVipSongs = vipSongs
          const partSongs = this.onceLoadVipSongs.slice(this.loadAudioCount * (this.onceLoadVipSongsPage++), this.loadAudioCount)
          this.searchSongsAudio(partSongs).then(() => {
            this.list = [...this.list, ...partSongs]
            //console.log('after this.list=', this.list)
            this._hideLoad()
          })
        })
        .catch(() => {
          this._hideLoad()
        })
    } else if (this.platform === 'qq') {
      this.pullUpLoadQQVipSongs(this.loadAudioCount, true)
      //this._hideLoad()
      /*getQQMusicListDetail(this.songListId, this.qqListPage, this.qqListPageCount).then(data => {
        this.qqListCount = data.req_0.data.total_song_num
        // //console.log(data)
        this.list = formatSongs(data.req_0.data.songlist)
        document.title = this.platform + ' - '
        this._hideLoad()
      })*/
    }
  },
  methods: {
    confirmBind(songIndex) {
      if (this.chosenChecked[songIndex]) {
        // 确认绑定
        //console.log('checkedChosen songIndex===', songIndex)
        const toBindAudioIndex = this.chosenAudio[songIndex]
        //console.log('this.chosenAudio[songIndex]', toBindAudioIndex)
        if (!toBindAudioIndex || toBindAudioIndex === 0) {
          // 没有选择音频或选择的是原版音频
          this.$mmToast('未绑定任何音频')
        } else {
          const {bvid, cid} = this.songsAudioCandidates[songIndex][toBindAudioIndex].audioSource
          //console.log('info====', bvid, cid)
          const toBindSongId = this.songsAudioCandidates[songIndex][0].id
          addBindInfo(toBindSongId, {bvid, cid})
        }
        this.checkedCount++
        //console.log('newList.length===', this.chosenChecked.length)
        if (this.checkedCount === this.chosenChecked.length) {
          //console.log('绑定剩余部分')
          this.loadNext()
        }
      } else {
        // 取消确认
        //console.log('取消不了, 已经绑定了. 需要重新绑定, 请单独绑定该歌曲. 教程看"单只歌曲绑定"')
      }
    },
    testAudio(songIndex) {
      if (!this.chosenAudio || this.chosenAudio[songIndex] === '') {
        this.$mmToast('取消绑定该歌曲')
        return
      }
      //console.log('testAudio=', songIndex)
      //console.log('songsAudioCandidates=', this.songsAudioCandidates)
      // //console.log('songsAudioCandidates=', this.songsAudioCandidates[songIndex][0].id)
      //console.log('songsAudioCandidates=', this.songsAudioCandidates[songIndex][this.chosenAudio[songIndex]].id)
      //console.log('@@@@@@@this.songsAudioCandidates[songIndex][this.chosenAudio[songIndex]]', this.songsAudioCandidates[songIndex][this.chosenAudio[songIndex]])
      this.selectItemPlay(this.songsAudioCandidates[songIndex][this.chosenAudio[songIndex]])
      // //console.log('songsAudioCandidates=', this.songsAudioCandidates[2])
    },
    loadNext() {
      if (this.lockUp) {
        return
      }
      this.lockUp = true // 锁定滚动加载
      if (this.platform === 'qq')
        this.pullUpLoadQQVipSongs()
      else if (this.platform === 'netease' || this.platform === 'custom') {
        //console.log('this.onceLoadVipSongsPage', this.onceLoadVipSongsPage)
        const offset = this.loadAudioCount * (this.onceLoadVipSongsPage++)
        const partSongs = this.onceLoadVipSongs.slice(offset, offset + this.loadAudioCount)
        if (!partSongs || partSongs.length === 0) {
          this._hideLoad()
          this.$mmToast('歌单中没有更多VIP歌曲需要绑定了！')
          return
        }
        this.searchSongsAudio(partSongs).then(() => {
          this.list = [...this.list, ...partSongs]
          //console.log('after this.list=', this.list)
          this._hideLoad()
        })
      }
    },

    bindSongsAudio_old() {
      this.list = []
      if (this.platform === 'qq') {
        //console.log('qq bind')
        this.pullUpLoadQQVipSongs(3, true)
      } else {
        //console.log('other bind')
      }
    },
    pullUpLoadQQVipSongs(count = this.loadAudioCount, start = false) {
      this.mmLoadShow = true
      if (!start) this.qqListPage++
      //console.log('!!!!!!!!!!! pullUpLoadQQVipSongs')
      const vipSongs = []
      let qqSongs = []
      //let qqSongCandidates = []
      getQQMusicListDetail(this.songListId, this.qqListPage * this.qqListPageCount, this.qqListPageCount).then(data => {
        if (data.req_0.data.songlist.length === 0) {
          this._hideLoad()
          this.$mmToast('歌单中没有更多VIP歌曲需要绑定了！')
          return
        }
        data.req_0.data.songlist.forEach(music => {
          if (parseInt(music.pay.pay_play))
            vipSongs.push(music)
        })
        //console.log('vipSongs.length', vipSongs.length)
        qqSongs = formatSongs(vipSongs)
        //console.log('before qqSongs=', qqSongs)
        // 这个for循环可以和上面data.req_0.data.songlist.forEach()合并
        this.searchSongsAudio(qqSongs).then(() => {
          this.list = [...this.list, ...qqSongs]
          //console.log('after this.list=', this.list)
          if (count - vipSongs.length > 0) {
            return this.pullUpLoadQQVipSongs(count - vipSongs.length)
          }
          //console.log('this._hideLoad() pullUpLoadQQVipSongs')
          this._hideLoad()
        })
        /*for (let j = 0; j < qqSongs.length;j++) {
          if (j > 2) {
            break
          }
          //setTimeout(()=> {//console.log('qqSongs[j]------', qqSongs[j])}, 100)
          this.exactSearchAudio(qqSongs[j], true).then(candidates => {
            // Vue.set(this.songsAudioCandidates, j, []);
            // this.songsAudioCandidates[j].push(qqSongs[j])
            const len = this.songsAudioCandidates.length
            //console.log('len===', len)
            //console.log('j===', j)
            //console.log('qqSongs[j]', qqSongs[j])
            Vue.set(this.songsAudioCandidates, len, []);
            this.songsAudioCandidates[len].push(qqSongs[j])

            // Vue.set(qqSongCandidates, j, []);
            // qqSongCandidates[j].push(qqSongs[j])
            ////console.log('candidates', Array.isArray(candidates))
            ////console.log('candidates', (candidates))
            ////console.log('candidates', candidates[2])
            for (let i = 0; i < candidates.length; i++) {
              // this.songsAudioCandidates[j].push(candidates[i]);
              this.songsAudioCandidates[len].push(candidates[i]);
              // qqSongCandidates[j].push(candidates[i]);
            }

          }).then(() => {
            //this.list = [...this.list, ...qqSongs]
            //this.songsAudioCandidates = [...this.songsAudioCandidates, ...qqSongCandidates]
            ////console.log('after this.list=', this.list)
            //console.log('after this.songsAudioCandidates=', this.songsAudioCandidates)
            //console.log('after qqSongCandidates=', qqSongCandidates)

          })
        }*/
      })
      /*.then(() => {
      this.list = [...this.list, ...qqSongs]
      //console.log('after this.list=', this.list)
      if (count - vipSongs.length > 0) {
        //this.pullUpLoadQQVipSongs(count - vipSongs.length)
      }
    })*/
    },
    async searchSongsAudio(songs) {
      this.mmLoadShow = true
      for (let j = 0; j < songs.length; j++) {
        /*if (j > 2) {
          break
        }*/
        //setTimeout(()=> {//console.log('songs[j]------', songs[j])}, 100)
        await this.exactSearchAudio(songs[j], true).then(candidates => {
          // Vue.set(this.songsAudioCandidates, j, []);
          // this.songsAudioCandidates[j].push(songs[j])
          //const len = this.songsAudioCandidates.length
          const len = this.list.length + j
          //console.log('len===', len)
          //console.log('j===', j)
          //console.log('songs[j]', songs[j])
          Vue.set(this.songsAudioCandidates, len, []);
          this.songsAudioCandidates[len].push(songs[j])

          // Vue.set(qqSongCandidates, j, []);
          // qqSongCandidates[j].push(songs[j])
          ////console.log('candidates', Array.isArray(candidates))
          ////console.log('candidates', (candidates))
          ////console.log('candidates', candidates[2])
          for (let i = 0; i < candidates.length; i++) {
            // this.songsAudioCandidates[j].push(candidates[i]);
            this.songsAudioCandidates[len].push(candidates[i]);
            // qqSongCandidates[j].push(candidates[i]);
          }
          //console.log('after this.songsAudioCandidates=', this.songsAudioCandidates)
        })
        /*.then(() => {
          //this.list = [...this.list, ...songs]
          //this.songsAudioCandidates = [...this.songsAudioCandidates, ...qqSongCandidates]
          ////console.log('after this.list=', this.list)
          ////console.log('after this.songsAudioCandidates=', this.songsAudioCandidates)
        })*/
      }
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
                // duration: duration,
                originDuration: reference.originDuration,
                mixInfo: {audioSourceFrom: 'bili', others: reference.platform},
              }
              list[i].complex = complex
              //@TODO 有重复bvid, 按道理来说,分页查询重复可能性不大. 暂时不管这个bug
              await createComplexSong(list[i]).then((complexSong) => {
                ////console.log('complexSong', complexSong)
                validData.push(complexSong)
              })
            }
          }
          /*list.forEach(item => {
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
          })*/
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
      ////console.log('validData[2]', validData[2])
      //console.log('validDate.length = ', validData.length)
      return validData
    },
    async selectItemPlay(music) {
      // //console.log(music)
      try {
        //if (music.platform === 'netease') {
        //const image = await this._getMusicDetail(music.id)
        // music.image = toHttps(image)
        //}
        this.selectAddPlay(music)
      } catch (error) {
        this.$mmToast('哎呀，出错啦~')
      }
    },
    pullUpLoadQQList() {
      //console.log('pullUpLoadQQList!!!!!!!!')
      /*this.qqListPage++
      getQQMusicListDetail(this.songListId, this.qqListPage * this.qqListPageCount, this.qqListPageCount).then(data => {
        if (data.req_0.data.songlist.length === 0) {
          this.$mmToast('歌单中没有更多歌曲了！')
          return
        }
        //console.log(data)
        this.list = [...this.list, ...formatSongs(data.req_0.data.songlist)]
      })*/
    },
    ...mapActions(['selectAddPlay',]),
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

.music-list {
  height: 100%;
}

.list-header {
  border-bottom: 1px solid @list_head_line_color;
  color: @text_color_active;

  .list-origin-time {
    padding-left: 15px;
  }

  .list-name {
    padding-left: 70px;
    user-select: none;
  }
}

.list-content {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.list-no {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: @text_color;
}

.list-item {
  display: flex;
  width: 100%;
  height: 50px;
  border-bottom: 1px solid @list_item_line_color;
  line-height: 50px;
  overflow: hidden;

  .list-num,
  .list-platform {
    padding-left: 7px;
  }

  &.list-item-no {
    justify-content: center;
    align-items: center;
  }

  &.on {
    color: #0d9dda;

    .list-num {
      font-size: 0;
      background: url('~assets/img/wave.gif') no-repeat center center;
    }

    /* .list-num,
    .list-platform {
      font-size: 0;
      background: url('~assets/img/wave.gif') no-repeat center center;
    }*/
  }

  //&:hover {
  &:not([class*='list-header']):hover {
    color: red;

    .list-name {
      //padding-right: 111px;
      //background-color: red;
      //background-color: red;

      .list-menu-icon-play {
        display: block;
      }
    }
  }

  &:not([class*='list-header']):hover {
    .list-name {
      padding-right: 80px;

      .list-menu-icon-play {
        display: block;
      }
    }

    .list-num,
    .list-platform,
    .list-time,
    .list-album,
    .list-origin-time {
      font-size: 0;

      .list-menu-icon-del {
        display: block;
      }
    }

    .list-artist {
      font-size: 0;

      .list-menu-icon-add {
        display: block;
      }
    }
  }

  .list-num,
  .list-platform {
    display: block;
    width: 30px;
    margin-right: 10px;
    text-align: center;
  }

  .list-name {
    position: relative;
    flex: 1;
    box-sizing: border-box;

    & > span {
      text-overflow: ellipsis;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }

    small {
      margin-left: 5px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }

    /*hover菜单*/

    .list-menu-icon-play {
      display: none;
      position: absolute;
      top: 50%;
      //right: 10px;
      left: -60px;
      height: 40px;
      font-size: 0;
      transform: translateY(-50%);
    }
  }

  .list-artist,
  .list-album {
    position: relative;
    display: block;
    width: 300px;
    .no-wrap();
    @media (max-width: 1440px) {
      width: 200px;
    }
    @media (max-width: 1200px) {
      width: 150px;
    }

    .list-menu-icon-add {
      display: none;
      position: absolute;
      top: 50%;
      left: 34px;
      transform: translateY(-50%);
    }
  }

  .list-album {
    .list-menu-icon-del {
      display: none;
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
  }

  .list-time,
  .list-origin-time {
    display: block;
    width: 60px;
    position: relative;

    .list-menu-icon-del {
      display: none;
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
  }
}

.limited {
  //text-decoration: line-through;
  color: rgb(24, 1, 1);
}

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

@media (max-width: 960px) {
  .list-item .list-name {
    padding-right: 70px;
  }
}

@media (max-width: 768px) {
  .list-item {
    .list-name .list-menu-icon-play {
      display: block;
    }

    .list-artist,
    .list-album {
      width: 20%;
    }
  }
}

@media (max-width: 640px) {
  .list-item {
    .list-artist {
      width: 80px;
    }

    .list-album,
    .list-time,
    list-origin-time {
      display: none;
    }
  }
}
</style>
