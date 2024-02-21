<template>
  <!--歌曲列表-->
  <div class="music-list flex-col">
    <template v-if="list.length > 0">
      <slot name="listBtnHead"></slot>
      <div class="list-item list-header">
        <!--@TODO 样式有问题-->
        <span class="list-platform">平台</span>
        <span class="list-num">序号</span>
        <span class="list-name">歌曲</span>
        <span class="list-artist">歌手</span>
        <span class="list-time">音频时长</span>
        <span class="list-origin-time">原版时长</span>
        <span class="list-album">专辑</span>
        <span v-if="bindAudio" class="list-name">绑定</span>
      </div>

      <div ref="listContent" class="list-content" @scroll="listScroll($event)">
        <!-- @TODO 这里每个item都绑定了事件. 可以用事件委派来优化 -->
        <div
          v-for="(item, index) in list"
          :key="item.id"
          class="list-item"
          :class="{
            'limited': item.limit !== 0 && item.limit !== 8,
            on: currentMusic.id === item.id,
            [itemBackgrounds[item.platform]]: itemBackgrounds[item.platform]
            }"
          @dblclick="selectItem(item, index, $event)"
        >
          <span class="list-platform" v-text="item.platform"></span>
          <span class="list-num" v-text="index + 1"></span>
          <!--歌名+播放/暂停-->
          <div class="list-name">
            <span>{{ item.name + (item.subTitle ? ' >> ' + item.subTitle : '') }}</span>
            <div class="list-menu-icon-play">
              <mm-icon
                class="hover"
                :type="getPlayIconType(item)"
                :size="40"
                @click.stop="selectItem(item, index)"
              />
            </div>
          </div>
          <!-- 歌手+添加歌单按钮 -->
          <span class="list-artist">
            {{ item.singer }}
            <!-- 不能在搜索页中显示. 因为搜索页没有封装全music对象, 且不利于complex类型的song添加到歌单 -->
            <mm-icon
              v-if="listType !== 'search' && listType!== 'listDetails' && item.platform !== 'bili'"
              class="hover list-menu-icon-add"
              type="jiahao1"
              :size="40"
              @click.stop="openDialog(0, item)"
            />
          </span>
          <!-- 可听时长 -->
          <span class="list-time">
            {{ item.duration % 3600 | format }}
          </span>
          <!--真实时长+搜索音源按钮-->
          <span class="list-origin-time">
            {{ item.originDuration % 3600 | format }}
            <!-- 搜索音源按钮-->
            <mm-icon
              v-show="item.platform !== 'bili' && item.platform !== 'complex'"
              class="hover list-menu-icon-del"
              type="chazhao"
              :size="40"
              @click.stop="searchAudio(item)"
            />
            <!--  <mm-icon
              class="hover list-menu-icon-del"
              type="delete-mini"
              :size="40"
              @click.stop="searchAudio(item)"
            />-->
          </span>
          <!-- 专辑+删除歌曲按钮 -->
          <span class="list-album">
            {{ item.album }}
            <!--删除歌曲按钮-->
            <mm-icon
              v-if="listType !== 'search' && listType !== 'neteaseListDetails' && listType !== 'qqListDetails'"
              class="hover list-menu-icon-del"
              type="delete-mini"
              :size="40"
              @click.stop="deleteItem(index)"
            />
          </span>
          <!--操作绑定音频-->
          <div v-if="bindAudio" class="list-bind">
            <!--            <span>{{ item.name + (item.subTitle ? ' >> ' + item.subTitle : '') }}</span>-->
            <!--            <el-switch
                          v-model="value2"
                          active-color="#13ce66"
                          inactive-color="#ff4949">
                        </el-switch>-->
            <el-select @change="testAudio(index)" clearable v-model="chosenAudio[index]" placeholder="请选择">
              <el-option
                v-for="(candidate,i) in songsAudioCandidates[index]"
                :key="i"
                :label="candidate.id"
                :value="i">
              </el-option>
            </el-select>
          </div>
        </div>
        <slot name="listBtn"></slot>
      </div>
    </template>
    <mm-no-result v-else title="弄啥呢，怎么啥也没有！！！"/>
    <!--选择歌单进行添加歌曲-->
    <mm-dialog
      ref="addMusicToListDialog"
      head-text="添加歌曲到歌单"
      confirm-btn-text="添加"
      cancel-btn-text="取消"
      @confirm="addCustomList"
    >
      <div class="mm-dialog-text">
        (输入完回车或点击空白区域检查内容变化,勿直接点击"添加")
        <el-select
          v-model="chosenMusicListTitle"
          filterable
          allow-create
          default-first-option
          placeholder="请选择歌单名称或输入新歌单名称">
          <el-option
            v-for="item in customMusicListMap"
            :key="item.id"
            :label="item.title"
            :value="item.title">
          </el-option>
          <!--@TODO disabled属性可以禁止选用该option,可以通过判断歌单歌曲是否到达300首进行禁用-->
        </el-select>
      </div>
    </mm-dialog>
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
      <div slot="btn" @click="openDialog(3)">帮助</div>
      <div slot="btn2" @click="openDialog(4)">取消</div>
    </mm-dialog>
    <!--绑定bvid帮助-->
    <mm-dialog
      ref="helpDialog"
      head-text="绑定bvid帮助"
      confirm-btn-text="绑定"
      cancel-btn-text="取消"
      @confirm="openDialog(2)"
    >
      <div class="mm-dialog-text">
        <p>1、如果有想绑定的b站视频,可以输入bvid. bvid是视频的id(以BV开头)</p>
        <p>2、bvid可以参考"bili搜索"界面中播放音频时的歌手名</p>
        <p>3、如果没有想要绑定的视频,可以使用"自动搜索音频"</p>
        <p>4、自动搜索的算法不够智能, 如果没有搜到合适的结果, 请手动搜索视频. 复制其bvid, 再重复当前步骤,输入bvid</p>
        <p>5、完成以上步骤后. "正在播放"页面中会有紫色背景的歌曲. 可以将紫色背景的歌曲保存至歌单. 避免未来再次寻找音频</p>
        <p>6、注意是紫色背景,platform为complex的歌曲才能加入歌单. 普通蓝色歌曲仅包含b站音频, 并未包含歌词等信息. 这种音频需要重复绑定操作(具体的看视频).</p>
      </div>
    </mm-dialog>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from 'vuex'
import {format, generateUUID, toHttps} from '@/utils/util'
import MmNoResult from 'base/mm-no-result/mm-no-result'
import MmDialog from 'base/mm-dialog/mm-dialog'
import {addMusicListToLocal, addMusicToCustomList} from "@/store/actions";
import cloneDeep from 'lodash/cloneDeep';
import {createCustomMusicListInfo} from "@/utils/music_list/MusicListInfo";
import {getMusicDetail} from "@/api";
/*
1. 歌单页面下提供"绑定所有vip歌曲". 点击后将歌单中的vip歌曲提取跳转到另一个detail页面.
2. 跳转后的detail页面首次加载20条vip歌曲, 并搜索对应的资源. 当用户开始选择这20首vip歌曲的音频时触发加载下20首的音频
3. 对于确定了音频的歌曲禁用绑定按钮, 暂时不提供撤回功能
 */
// 触发滚动加载的阈值
const THRESHOLD = 100

export default {
  name: 'MusicList',
  components: {
    MmDialog,
    MmNoResult,
  },
  filters: {
    format,
  },
  props: {
    // 歌曲数据
    list: {
      type: Array,
      default: () => [],
    },
    bindAudio: {
      type: Boolean,
      default: false,
    },
    /**
     * 列表类型
     */
    listType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      value2: false,

      toAddSong: null,
      chosenMusicListTitle: '', //用户选择的歌单id或新建歌单名称
      musicListDesc: '',
      musicListTag: [],
      musicListCoverImg: 'https://qpic.y.qq.com/music_cover/UwsgicvXzUsibGjO09TicjLpzMS4lkZbvGbzBjyxibwUDiaTDJibuib1nxIGw/600?n=1',
      lockUp: true, // 是否锁定滚动加载事件,默认锁定
      itemBackgrounds: {
        qq: 'qq-background-color',
        netease: 'netease-background-color',
        bili: 'bili-background-color',
        complex: 'complex-background-color',
      },
      musicInfo: null,
      hasBvid: '',
      chosenAudio: [],
    }
  },
  computed: {
    ...mapGetters(
      [
        'playing',
        'currentMusic',
        'musicListMap',
        'manageMusicListRes',
        'songsAudioCandidates',
      ]),
    customMusicListMap() {
      // //console.log('this.musicListMap', this.musicListMap)
      // //console.log('222222222222', this.musicListMap.filter(item => item.platform === 'custom').map(item => item))
      return this.musicListMap.filter(item => item.platform === 'custom').map(item => item)
    }
  },
  watch: {
    songsAudioCandidates(newList, oldList) {
      //console.log('songsAudioCandidates//////////')
      //console.log('songsAudioCandidates==', this.songsAudioCandidates)
      this.chosenAudio = new Array(newList.length)
    },
    //监听list,是为了修改lockUp. 和comment.vue中一样,oldList是上一次加载的数据
    list(newList, oldList) {
      // if (this.listType !== 'search') {
      if (this.listType !== 'search' && this.listType !== 'qqListDetails') {
        return
      }
      if (newList.length !== oldList.length) {
        this.lockUp = false
      } else if (newList[newList.length - 1].id !== oldList[oldList.length - 1].id) {
        this.lockUp = false
      }
    },
  },
  activated() {
    //console.log('musicListMap=', this.musicListMap)
    // 当切换到其它组件,再次回来时将listContent恢复到上次的状态.
    //this.scrollTop是组件music-list的属性.当music-list下拉时就会修改该属性值,可以通过mm.$children[0].$children[2].$children[1].$children[1].scrollTop查看
    this.scrollTop && this.$refs.listContent && (this.$refs.listContent.scrollTop = this.scrollTop)
  },
  methods: {
    testAudio(songIndex) {
      if (!this.chosenAudio || this.chosenAudio[songIndex] === '') {
        //console.log('取消绑定该歌曲')
        return
      }
      //console.log('testAudio=', songIndex)
      //console.log('songsAudioCandidates=', this.songsAudioCandidates)
      //console.log('songsAudioCandidates=', this.songsAudioCandidates[songIndex][0].id)
      //console.log('songsAudioCandidates=', this.songsAudioCandidates[songIndex][this.chosenAudio[songIndex]].id)
      this.selectItemPlay(this.songsAudioCandidates[songIndex][this.chosenAudio[songIndex]])
      //console.log('songsAudioCandidates=', this.songsAudioCandidates[2])
    },
    async selectItemPlay(music) {
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
    bindBvid() {
      if (!this.hasBvid) {
        this.$mmToast('没有bvid,启动自动搜索')
      }
      //console.log('this.musicInfo', this.musicInfo)
      if (this.musicInfo.platform === 'netease') {
        // 添加封面url
        getMusicDetail(this.musicInfo.id).then((res) => {
          this.musicInfo.image = res.songs[0].al.picUrl
          //console.log('fjhgjfjhtwertwtr')
        }).then(() => {
          //console.log('22222twertwtr')
          this.musicInfo.audioSource = {tryBind: this.hasBvid}
          //console.log('twertwtr')
          this.setSearchAudio(this.musicInfo)
          //console.log('1111twertwtr')
          this.$router.push({
            name: 'bili-search',
          })
        })
      } else {
        this.musicInfo.audioSource = {tryBind: this.hasBvid}
        this.setSearchAudio(this.musicInfo)
        //console.log('t4524526647wertwtr')
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
      this.musicInfo = cloneDeep(music)
      //console.log("this.musicInfo=", this.musicInfo)
      this.openDialog(2)
    },
    // 删除事件
    deleteItem(index) {
      this.$emit('del', index) // 触发删除事件
    },
    addCustomList() {
      this.setManageMusicListRes(false)
      //console.log("addCustomList==")
      //console.log(this.chosenMusicListTitle)
      //console.log(this.musicListMap)
      if (this.chosenMusicListTitle.replace(/(^\s+)|(\s+$)/g, '') === '') {
        this.$mmToast('歌单名称不能为空！')
        return
      }
      let id = ''
      for (let i = 0; i < this.musicListMap.length; i++) {
        if (this.musicListMap[i].title === this.chosenMusicListTitle) {
          id = this.musicListMap[i].id
          break;
        }
      }
      if (id === '') {
        id = generateUUID()
        //console.log('id==', id)
        const musicListInfo = createCustomMusicListInfo(id, this.chosenMusicListTitle, this.musicListDesc, this.musicListCoverImg, this.musicListTag)
        this.addMusicListToLocal(musicListInfo)
        if (!this.manageMusicListRes) {
          this.$mmToast('歌单数量限制')
          return
        }
      }
      let cloneObj = {}
      cloneObj = cloneDeep(this.toAddSong)
      cloneObj.audioSource ? cloneObj.audioSource.urls = null : 0 //去除urls, 因为bili的url会自动刷新
      this.addMusicToCustomList({music: cloneObj, id})
      if (!this.manageMusicListRes) {
        this.$mmToast('song list contains limit or exists music')
      } else {
        this.$mmToast('add success')
      }
    },
    // 打开对话框
    openDialog(key, song) {
      this.toAddSong = song
      switch (key) {
        case 0:
          this.$refs.addMusicToListDialog.show()
          break
        case 1:
          this.$refs.addMusicToListDialog.hide()
          break
        case 2:
          this.$refs.bindBvidDialog.show()
          break
        case 3:
          this.$refs.bindBvidDialog.hide()
          this.$refs.helpDialog.show()
          break
        case 4:
          this.$refs.bindBvidDialog.hide()
          break
      }
    },
    // 滚动事件
    listScroll(e) {
      const scrollTop = e.target.scrollTop
      this.scrollTop = scrollTop
      // if (this.listType !== 'search' || this.lockUp) {
      if ((this.listType !== 'search' && this.listType !== 'qqListDetails') || this.lockUp) {
        return
      }
      const {scrollHeight, offsetHeight} = e.target
      if (scrollTop + offsetHeight >= scrollHeight - THRESHOLD) {
        this.lockUp = true // 锁定滚动加载
        this.$emit('pullUp') // 触发滚动加载事件
      }
    },
    // 回到顶部
    scrollTo() {
      this.$refs.listContent.scrollTop = 0
    },
    // 播放暂停事件
    selectItem(item, index, e) {
      //这个存在的意义不清楚??因为它不仅判断e是否传过来,还判断className是否是list-menu-icon-del,但是list-menu-icon-del中没有调用这个方法
      if (e && /list-menu-icon-del/.test(e.target.className)) {
        ////console.log('music-list.vue#selectItem list-menu-icon-del')
        return
      }
      if (this.currentMusic.id && item.id === this.currentMusic.id) {
        this.setPlaying(!this.playing)
        return
      }

      /**
       * 为了修复 safari、 ios 微信、安卓 UC 无法播放问题，暂时移除接口校验直接播放
       */
      this.$emit('select', item, index) // 触发点击播放事件

      // getMusicUrl(item.id)
      // .then(res => {
      //     if (!res.data.data[0].url) {
      //         this.$mmToast('当前音乐无法播放，请播放其他音乐')
      //     } else {
      //         this.$emit('select', item, index)//触发点击播放事件
      //     }
      // });
      // getCheckMusic(item.id)
      // .then(res => {
      //     if (res.data.message !== 'ok') {
      //         this.$mmToast('当前音乐无法播放，请播放其他音乐')
      //     } else {
      //         this.$emit('select', item, index)//触发点击播放事件
      //     }
      // }).catch(error => {
      //     this.$mmToast(error.response.data.message)
      // })
    },
    // 获取播放状态 type
    getPlayIconType({id: itemId}) {
      const {
        playing,
        currentMusic: {id},
      } = this
      return playing && id === itemId ? 'pause-mini' : 'play-mini'
    },
    // 搜索音频
    /*searchAudio(item) {
      this.$emit('searchAudio', item) // 触发删除事件
    },*/
    ...mapMutations({
      setPlaying: 'SET_PLAYING',
      setManageMusicListRes: 'SET_MANAGE_MUSIC_LIST_RES',
      setSearchAudio: 'SET_SEARCH_AUDIO',
    }),
    ...mapActions(['addMusicToCustomList', 'addMusicListToLocal', 'selectAddPlay',])
  },
}
</script>

<style lang="less" scoped>
/* 定义不同平台的背景色样式 */
.qq-background-color {
  background-color: #A9EF6A4C; /* 例如，这是QQ平台的背景色 */
}

.netease-background-color {
  background-color: rgba(215, 59, 59, 0.3); /* 例如，这是微信平台的背景色 */
}

.bili-background-color {
  background-color: #79F5E04C; /* 例如，这是Twitter平台的背景色 */
}

.complex-background-color {
  background-color: #9b48ee; /* 例如，这是Twitter平台的背景色 */
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
  color: #332D2DFF;
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
