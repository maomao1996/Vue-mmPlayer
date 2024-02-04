<template>
  <!--我的歌单-->
  <div class="videoList">
    <mm-loading v-model="mmLoadShow" />
    <template v-if="list.length > 0">
      <div v-for="item in formatList" :key="item.id" class="list-item" :title="item.name">
        <router-link :to="{ path: `/music/details/${item.id}` }" tag="div" class="videoList-item">
          <img referrerPolicy="no-referrer" v-lazy="`${item.coverImgUrl}?param=200y200`" class="cover-img" />
          <h3 class="name">{{ item.name }}</h3>
        </router-link>
      </div>
    </template>
    <mm-no-result v-else title="啥也没有哦，快去登录看看吧！" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { getUserPlaylist } from 'api'
import { loadMixin } from '@/utils/mixin'

import MmLoading from 'base/mm-loading/mm-loading'
import MmNoResult from 'base/mm-no-result/mm-no-result'

export default {
  name: 'UserList',
  components: {
    MmLoading,
    MmNoResult,
  },
  mixins: [loadMixin],
  data() {
    return {
      list: [], // 列表
    }
  },
  computed: {
    formatList() {
      return this.list.filter((item) => item.trackCount > 0)
    },
    ...mapGetters(['uid']),
  },
  watch: {
    // 登录了才加载用户歌单
    uid(newUid) {
      console.log('userList.vue#warch()#uid')
      if (newUid) {
        this.mmLoadShow = true
        this._getUserPlaylist(newUid)
      } else {
        this.list = []
      }
    },
  },
  created() {
    if (!this.uid) {
      this.mmLoadShow = false
    }
  },
  beforeDestroy() {
    console.log(' -- userList 组件 --- 死了')
  },
  activated() {
    console.log('userList.vue#actived()')
    if (this.uid && this.list.length === 0) {
      this.mmLoadShow = true
      this._getUserPlaylist(this.uid)
    } else if (!this.uid && this.list.length !== 0) {
      this.list = []
    }
  },
  methods: {
    // 获取我的歌单详情
    _getUserPlaylist(uid) {
      getUserPlaylist(uid).then((res) => {
        if (res.playlist.length === 0) {
          return
        }
        this.list = res.playlist.slice(1)
        this._hideLoad()
      })
    },
  },
}
</script>

<style lang="less" scoped>
.videoList {
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  .list-item {
    //float: left;
    float: left;
    width: calc(~'100% / 7');
    .videoList-item {
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
