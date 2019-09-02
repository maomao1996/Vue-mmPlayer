<template>
  <!--排行榜-->
  <div class="topList">
    <mm-loading v-model="mmLoadShow" />
    <template v-if="!mmLoadShow">
      <div class="topList-head">云音乐特色榜</div>
      <div class="topList-content">
        <div
          v-for="(item,index) in list"
          :key="index"
          class="list-item"
          :title="item.name+item.updateFrequency"
        >
          <router-link
            :to="{path:`/music/details/${item.id}`}"
            tag="div"
            class="topList-item"
          >
            <div class="topList-img">
              <img
                v-lazy="`${item.coverImgUrl}?param=300y300`"
                class="cover-img"
              />
            </div>
            <h3 class="name">{{ item.name }}</h3>
          </router-link>
        </div>
      </div>
      <div class="topList-head">热门歌单</div>
      <div class="topList-content">
        <div
          v-for="(item,index) in hotList"
          :key="index"
          class="list-item"
          :title="item.name+item.updateFrequency"
        >
          <router-link
            :to="{path:`/music/details/${item.id}`}"
            tag="div"
            class="topList-item"
          >
            <div class="topList-img">
              <img v-lazy="`${item.picUrl}?param=300y300`" class="cover-img" />
            </div>
            <h3 class="name">{{ item.name }}</h3>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { getToplistDetail, getPersonalized } from 'api'
import MmLoading from 'base/mm-loading/mm-loading'
import { loadMixin } from '@/utils/mixin'

export default {
  name: 'PlayList',
  components: {
    MmLoading
  },
  mixins: [loadMixin],
  data() {
    return {
      list: [], // 云音乐特色榜
      hotList: [] // 热门歌单
    }
  },
  created() {
    // 获取排行榜列表
    const _getToplistDetail = getToplistDetail().then(res => {
      if (res.data.code === 200) {
        let list
        list = res.data.list.filter(item => {
          if (item.ToplistType) {
            return item
          }
        })
        return list
      }
    })
    const _getPersonalized = getPersonalized().then(res => {
      if (res.data.code === 200) {
        return res.data.result
      }
    })
    Promise.all([_getToplistDetail, _getPersonalized]).then(
      ([list, hotList]) => {
        this.list = list
        this.hotList = hotList.slice()
        this._hideLoad()
      }
    )
  }
}
</script>

<style lang="less" scoped>
.topList {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  &-head {
    width: 100%;
    height: 34px;
    line-height: 34px;
    padding: 20px 0;
    font-size: @font_size_large;
    color: @text_color_active;
  }
  &-content {
    overflow: hidden;
  }
  .list-item {
    float: left;
    width: calc(~'100% / 7');
    .topList-item {
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
    .topList-img {
      position: relative;
      padding-top: 100%;
      width: 100%;
      height: 0;
      .cover-img {
        position: absolute;
        top: 0;
        left: 0;
      }
    }
  }
}
</style>
