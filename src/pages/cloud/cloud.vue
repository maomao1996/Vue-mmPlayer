<template>
  <!--云盘音乐(仅限账号密码登录)-->
  <div class="cloud-pan">
    <mm-loading v-model="mmLoadShow" />
    <music-list :list="list" @select="selectItem" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { getCloudPlaylist } from 'api'
import MmLoading from 'base/mm-loading/mm-loading'
import MusicList from 'components/music-list/music-list'
import { loadMixin } from '@/utils/mixin'

export default {
  name: 'Detail',
  components: {
    MmLoading,
    MusicList
  },
  mixins: [loadMixin],
  data() {
    return {
      list: [] // 列表
    }
  },
  computed: {
    ...mapGetters(['uid'])
  },
  watch: {
    uid(newVal) {
      if (newVal) return this.getList()
      this.list = []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      getCloudPlaylist()
        .then(playlist => {
          document.title = `我的云盘 - mmPlayer在线音乐播放器`
          this.list = playlist
          this._hideLoad()
        })
        .finally(() => {
          this._hideLoad()
        })
    },
    // 播放暂停事件
    selectItem(item, index) {
      document.title = `${item.name} - mmPlayer在线音乐播放器`
      this.selectPlay({
        list: this.list,
        index
      })
    },
    ...mapActions(['selectPlay'])
  }
}
</script>

<style lang="less" scoped>
.cloud-pan {
  position: relative;
  width: 100%;
  height: 100%;
  .musicList {
    width: 100%;
    height: 100%;
  }
}
</style>
