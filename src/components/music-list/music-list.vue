<template>
  <!--歌曲列表-->
  <div class="music-list flex-col">
    <template v-if="list.length > 0">
      <div class="list-item list-header">
        <!--@TODO 样式有问题-->
        <span class="list-platform">平台</span>
        <span class="list-num">序号</span>
        <span class="list-name">歌曲</span>
        <span class="list-artist">歌手</span>
        <span class="list-time">时长</span>
        <span class="list-origin-time">真实时长</span>
        <span class="list-album">专辑</span>
      </div>
      <div ref="listContent" class="list-content" @scroll="listScroll($event)">
        <!-- @TODO 这里每个item都绑定了事件. 可以用事件委派来优化 -->
        <div
          v-for="(item, index) in list"
          :key="item.id"
          class="list-item"
          :class="{
            on: currentMusic.id === item.id,
            [itemBackgrounds[item.platform]]: itemBackgrounds[item.platform]
            }"
          @dblclick="selectItem(item, index, $event)"
        >
          <span class="list-platform" v-text="item.platform"></span>
          <span class="list-num" v-text="index + 1"></span>
          <div class="list-name">
            <span>{{ item.name + (item.subTitle ? ' >> ' + item.subTitle : '') }}</span>
            <!--播放暂停-->
            <div class="list-menu">
              <mm-icon
                class="hover"
                :type="getPlayIconType(item)"
                :size="40"
                @click.stop="selectItem(item, index)"
              />
            </div>
          </div>
          <span class="list-artist">{{ item.singer }}
            <!-- 添加歌单按钮, 不能在搜索页中显示. 因为搜索页没有封装全music对象, 且不利于complex类型的song添加到歌单-->
            <mm-icon
              v-if="listType !== 'search' && listType!== 'listDetails' && item.platform !== 'bili'"
              class="hover list-menu-icon-add"
              type="jiahao1"
              :size="40"
              @click.stop="openDialog(0, item)"
            />
          </span>
          <span class="list-time">
            {{ item.duration % 3600 | format }}
            <!--删除歌曲按钮-->
            <mm-icon
              v-if="listType !== 'search'"
              class="hover list-menu-icon-del"
              type="delete-mini"
              :size="40"
              @click.stop="deleteItem(index)"
            />
          </span>
          <!--真实时长+删除歌曲/搜索音源按钮-->
          <span class="list-origin-time"  v-if="listType === 'search'">
            {{ item.originDuration % 3600 | format }}
            <!-- 搜索音源按钮-->
            <mm-icon
              class="hover list-menu-icon-del"
              type="chazhao"
              :size="40"
              @click.stop="searchAudio(item)"
            />
<!--            <mm-icon
              class="hover list-menu-icon-del"
              type="delete-mini"
              :size="40"
              @click.stop="searchAudio(item)"
            />-->
          </span >
          <span class="list-album">
            {{ item.album }}
          </span>
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
        (输入完名称请回车,最后点击确定)
        <el-select
          v-model="chosenListName"
          filterable
          allow-create
          default-first-option
          placeholder="请选择歌单名称或输入新歌单名称">
          <el-option
            v-for="item in musicListMap"
            :key="item.id"
            :label="item.listName"
            :value="item.listName">
          </el-option>
          <!--@TODO disabled属性可以禁止选用该option,可以通过判断歌单歌曲是否到达300首进行禁用-->
        </el-select>
      </div>
    </mm-dialog>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from 'vuex'
import {format} from '@/utils/util'
import MmNoResult from 'base/mm-no-result/mm-no-result'
import MmDialog from 'base/mm-dialog/mm-dialog'
import {setCustomMusicList} from "@/store/actions";
import cloneDeep from 'lodash/cloneDeep';

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
      toAddSong: null,
      chosenListName: '', //用户选择的歌单id或新建歌单名称
      lockUp: true, // 是否锁定滚动加载事件,默认锁定
      itemBackgrounds: {
        qq: 'qq-background-color',
        netease: 'netease-background-color',
        bili: 'bili-background-color',
        complex: 'complex-background-color',
        // 可以继续添加其他平台的背景色映射
      },
    }
  },
  computed: {
    ...mapGetters(
      [
        'playing',
        'currentMusic',
        'musicListMap',
        'manageCustomMusicListRes',
      ]),
  },
  watch: {
    //监听list,是为了修改lockUp. 和comment.vue中一样,oldList是上一次加载的数据
    list(newList, oldList) {
      if (this.listType !== 'search') {
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
    console.log('musicListMap=', this.musicListMap )
    // 当切换到其它组件,再次回来时将listContent恢复到上次的状态.
    //this.scrollTop是组件music-list的属性.当music-list下拉时就会修改该属性值,可以通过mm.$children[0].$children[2].$children[1].$children[1].scrollTop查看
    this.scrollTop && this.$refs.listContent && (this.$refs.listContent.scrollTop = this.scrollTop)
  },
  methods: {
    // 删除事件
    deleteItem(index) {
      this.$emit('del', index) // 触发删除事件
    },
    addCustomList() {
      console.log("addCustomList==")
      console.log(this.chosenListName)
      if (this.chosenListName.replace(/(^\s+)|(\s+$)/g, '') === '') {
        this.$mmToast('歌单名称不能为空！')
        return
      }
      let customListStorageKeyTail = ''
      this.musicListMap.forEach(item => {
        item.listName === this.chosenListName ? customListStorageKeyTail = item.id : ''
      })
      for (let i = 0; i < this.musicListMap.length; i++) {
        if (this.musicListMap[i].listName === this.chosenListName) {
          customListStorageKeyTail = this.musicListMap[i].id
          break;
        }
      }
      let cloneObj = {}
      if (this.toAddSong.platform !== 'bili') {
        cloneObj = cloneDeep(this.toAddSong)
        cloneObj.audioSource ? cloneObj.audioSource.urls = null : 0 //去除urls, 因为bili的url会自动刷新
      }
      this.setCustomMusicList({listName: this.chosenListName, music: cloneObj, customListStorageKeyTail})
      this.$mmToast(this.manageCustomMusicListRes)
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
      }
    },
    // 滚动事件
    listScroll(e) {
      const scrollTop = e.target.scrollTop
      this.scrollTop = scrollTop
      if (this.listType !== 'search' || this.lockUp) {
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
        //console.log('music-list.vue#selectItem list-menu-icon-del')
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
    searchAudio(item) {
      this.$emit('searchAudio', item) // 触发删除事件
    },
    ...mapMutations({
      setPlaying: 'SET_PLAYING',
    }),
    ...mapActions(['setCustomMusicList'])
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
  .list-platform
  {
    padding-left: 7px;
  }

  &.list-item-no {
    justify-content: center;
    align-items: center;
  }

  &.on {
    color: #0d9dda;

    .list-num,
    .list-platform
    {
      font-size: 0;
      background: url('~assets/img/wave.gif') no-repeat center center;
    }
  }

  &:hover {
    .list-name {
      //padding-right: 111px;
      background-color: red;

      .list-menu {
        display: block;
      }
    }
  }

  &:not([class*='list-header']):hover {
    .list-name {
      padding-right: 80px;

      .list-menu {
        display: block;
      }
    }

    .list-time,
    .list-origin-time
    {
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
  .list-platform
  {
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

    .list-menu {
      display: none;
      position: absolute;
      top: 50%;
      //right: 10px;
      left: -40px;
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

  .list-time,
  .list-origin-time
  {
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
    .list-name .list-menu {
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
    list-origin-time
    {
      display: none;
    }
  }
}
</style>
