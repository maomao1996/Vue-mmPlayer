<template>
  <div>
    <!--我的歌单-->
    <div class="user-list">
      <mm-loading v-model="mmLoadShow"/>
      <template v-if="musicListMap.length > 0">
        <!--        @TODO 导入的歌单和custom歌单展示时混在了一起, 建议分开-->
        <div v-for="item in musicListMap" :key="item.id" class="list-item" :title="item.title">
          <!--          目前只支持本网站的歌曲跳转到歌单详情页-->
          <router-link :to="{ path: `/music/details/${item.platform}/${item.id}` }" tag="div" class="user-list-item">
            <img referrerPolicy="no-referrer" v-lazy="`${item.image}`" class="cover-img"/>
            <h3 class="name">{{ item.title }}</h3>
          </router-link>
        </div>
      </template>
      <template v-if="userNeteaseList.length > 0">
        <div v-for="item in formatList" :key="item.id" class="list-item" :title="item.name">
          <router-link :to="{ path: `/music/details/netease/${item.id}` }" tag="div" class="user-list-item">
            <img referrerPolicy="no-referrer" v-lazy="`${item.coverImgUrl}?param=200y200`" class="cover-img"/>
            <h3 class="name">{{ item.name }}</h3>
          </router-link>
        </div>
      </template>
      <div class="list-item">
        <div @click="openDialog(0)" class="user-list-item">
          <img referrerPolicy="no-referrer"
               src="https://qpic.y.qq.com/music_cover/UwsgicvXzUsibGjO09TicjLpzMS4lkZbvGbzBjyxibwUDiaTDJibuib1nxIGw/600?n=1"
               class="cover-img"/>
          <h3 class="name"> 导入QQ歌单 </h3>
        </div>
      </div>
      <mm-no-result title="可将'非搜索页'中的歌曲添加单曲到歌单！"/>
      <!--导入qq歌单-->
      <mm-dialog
        ref="importQQMusicListDialog"
        head-text="导入qq歌单"
        confirm-btn-text="导入"
        cancel-btn-text="取消"
        @confirm="importQQMusicList"
      >
        <div class="mm-dialog-text">
          <input
            v-model.trim="otherPlatformListId"
            class="mm-dialog-input"
            autofocus
            placeholder="请输入您QQ音乐歌单id"
            @keyup.enter="importQQMusicList"
          />
        </div>
        <div slot="btn" @click="openDialog(1)">帮助</div>
      </mm-dialog>
      <!--帮助-->
      <mm-dialog
        ref="helpDialog"
        head-text="导入歌单帮助"
        confirm-btn-text="明白了"
        cancel-btn-text="取消"
        @confirm="openDialog(0)"
      >
        <div class="mm-dialog-text">
          <p>1. QQ音乐歌单目前只能手动添加. 已经发现批量导入方式, 未来添加该功能</p>
          <p>2. 在手机端或PC端的QQ音乐客户端中点击"分享歌单"</p>
          <p>3. 将分享链接在浏览器中打开. 页面打开后,地址栏(链接输入框)中的id后面的数字或`https://y.qq.com/n/ryqq/playlist/xxxxxx`中的xxxxxx部分就是QQ歌单id</p>
          <p>4. 在当前网站中的"我的歌单"中点击导入QQ歌单,输入QQ歌单id</p>
        </div>
      </mm-dialog>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from 'vuex'

import {getUserPlaylist} from 'api/index'
import {loadMixin} from '@/utils/mixin'

import MmLoading from 'base/mm-loading/mm-loading'
import MmNoResult from 'base/mm-no-result/mm-no-result'
import MmDialog from "base/mm-dialog/mm-dialog";
import {addOtherPlatformMusicList} from "@/store/actions";
import {createQqList} from "@/utils/music_list/createQqList";

export default {
  name: 'UserList',
  components: {
    MmLoading,
    MmNoResult,
    MmDialog,
  },
  mixins: [loadMixin],
  data() {
    return {
      otherPlatformListId: 0,
      userNeteaseList: [], // netease用户歌单列表
      customList: [], //本网站歌单列表
    }
  },
  computed: {
    formatList() {
      return this.userNeteaseList.filter((item) => item.trackCount > 0)
    },
    ...mapGetters(['uid', 'musicListMap', 'manageMusicListRes']),
  },
  watch: {
    // 登录了就加载用户歌单
    uid(newUid) {
      //console.log('userList.vue#warch()#uid')
      if (newUid) {
        this.mmLoadShow = true
        this._getUserPlaylist(newUid)
      } else {
        this.userNeteaseList = []
      }
      this.mmLoadShow = false
    },
  },
  created() {
    if (this.uid)
      this._getUserPlaylist(this.uid)
    this.mmLoadShow = false
  },
  beforeDestroy() {
    //console.log(' -- userList 组件 --- 死了')
  },
  /*activated() {
    //console.log('userList.vue#actived()')
    ////console.log('musicListMap', this.musicListMap)

    if (this.uid && this.userNeteaseList.length === 0) {
      this.mmLoadShow = true
      this._getUserPlaylist(this.uid)
    } else if (!this.uid && this.userNeteaseList.length !== 0) {
      this.userNeteaseList = []
    }
  },*/
  methods: {
    importQQMusicList() {
      // this.addOtherPlatformMusicList({id: this.otherPlatformListId, listName:'test'})
      //this.$mmToast(this.manageMusicListRes)
      createQqList(this.otherPlatformListId).then(qqMusicListInfo => {
        this.addMusicListToLocal(qqMusicListInfo)
        //console.log("after add:", this.musicListMap)
        this.$mmToast('import success')
      })
    },
    // 打开对话框
    openDialog(key) {
      switch (key) {
        case 0:
          this.$refs.importQQMusicListDialog.show()
          break
        case 1:
          this.$refs.importQQMusicListDialog.hide()
          this.$refs.helpDialog.show()
          break
        case 2:
          this.$refs.importQQMusicListDialog.hide()
          break
      }
    },
    // 获取netease我的歌单详情
    _getUserPlaylist(uid) {
      getUserPlaylist(uid).then((res) => {
        if (res.playlist.length === 0) {
          return
        }
        // 对res.playlist进行浅拷贝,从index=1开始拷贝
        this.userNeteaseList = res.playlist.slice(1)
        this._hideLoad()
      })
    },
    ...mapActions(['addMusicListToLocal',]),
  },
}
</script>

<style lang="less" scoped>
.user-list {
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  .list-item {
    //float: left;
    float: left;
    width: calc(~'100% / 7');

    .user-list-item {
      width: 130px;
      text-align: center;
      cursor: pointer;
      margin: 0 auto 20px;

      &:hover {
        color: #fff;
      }

      .name {
        height: 30px;
        line-height: 30px;
        font-size: @font_size_medium;
        .no-wrap();
      }

      @media (max-width: 1100px) {
        width: 80%;
      }
    }

    @media (max-width: 1500px) {
      width: calc(~'100% / 6');
    }
    @media (max-width: 1400px), (max-width: 960px) {
      width: calc(~'100% / 5');
    }
    @media (max-width: 1280px), (max-width: 768px) {
      width: calc(~'100% / 4');
    }
    @media (max-width: 540px) {
      width: calc(~'100% / 3');
    }
  }
}
</style>
