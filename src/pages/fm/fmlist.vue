<template>
  <!--歌单详情-->
  <div class="details">
    <mm-loading v-model="mmLoadShow" />
    <music-list
      :list="list"
      @select="selectItem"
    >
      <div
        slot="listBtn"
        class="list-btn"
      >
        <span @click="loadMore">加载更多</span>
      </div>
    </music-list>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { getFmList } from "api";
import MmLoading from "base/mm-loading/mm-loading";
import MusicList from "components/music-list/music-list";
import { formatTopSongs } from "assets/js/song";
import { loadMixin } from "assets/js/mixin";

export default {
  name: "detail",
  mixins: [loadMixin],
  components: {
    MmLoading,
    MusicList
  },
  data() {
    return {
      list: [], // 列表
      id: "",
      page: 1,
      size: 12,
      isEnd: false
    };
  },
  mounted() {
    this.id = this.$route.params.id;
    this.loadMore();
  },
  methods: {
    loadMore() {
      if (this.isEnd) return;
      this.mmLoadShow = true;
      // 获取歌单详情
      getFmList({ id: this.id, page: this.page }).then(res => {
        //console.log(res);
        Array.prototype.push.apply(this.list, res.list);
        this._hideLoad();
        this.page += 1;
        if (this.list.length >= res.total) this.isEnd = true;
      });
    },
    // 播放暂停事件
    selectItem(item, index) {
      this.selectPlay({
        list: this.list,
        index
      });
    },
    ...mapActions(["selectPlay"])
  }
};
</script>

<style lang="less" scoped>
.details {
  position: relative;
  width: 100%;
  height: 100%;
  .musicList {
    width: 100%;
    height: 100%;
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
  }
}
</style>
