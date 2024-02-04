<template>
  <!--选项-->
  <div class="music-btn">
    <router-link to="/music/playlist" tag="span">正在播放</router-link>
    <router-link to="/music/toplist" tag="span">推荐</router-link>
    <router-link to="/music/search" tag="span">搜索</router-link>
    <router-link to="/music/bilisearch" tag="span">bili搜索</router-link>
    <router-link to="/music/userlist" tag="span">我的歌单</router-link>
<!--    当视口宽小于960时显示-->
    <span class="show-960" @click="$emit('onClickLyric')">歌词</span>
<!--    @TODO '我听过的' -- 优化方案:
    现在的缺陷: 1.再次播放'我听过的',顺序会被打乱. 2.因为顺序会被打乱,所以历史记录就是不准确的. 3.没有记录每首歌曲听的次数,不方便未来收集数据用于"推荐算法"
    优化方案: 1. 目前playlist和historylist有某种关联, 另外还有一个orderlist. 这三者应该需要重新设计一下
    -->
    <router-link to="/music/historylist" tag="span">我听过的</router-link>
  </div>
</template>

<script>
export default {}
</script>

<style lang="less" scoped>
.music-btn {
  width: 100%;
  height: 60px;
  font-size: 0;
  white-space: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  span {
    display: inline-block;
    height: 40px;
    box-sizing: border-box;
    margin-right: 8px;
    padding: 0 23px;
    border: 1px solid @btn_color;
    color: @btn_color;
    border-radius: @btn_border_radius;
    font-size: 14px;
    line-height: 40px;
    overflow: hidden;
    cursor: pointer;
    &:nth-last-of-type(1) {
      margin: 0;
    }
    &:hover,
    &.active {
      border-color: @btn_color_active;
      color: @btn_color_active;
    }
  }
  @media (min-width: 960px) {
    span.show-960 {
      display: none;
    }
  }
  @media (max-width: 960px) {
    span.show-960 {
      display: inline-block;
    }
  }
  @media (max-width: 768px) {
    height: 50px;
    span {
      height: 35px;
      padding: 0 10px;
      margin-right: 6px;
      line-height: 35px;
    }
  }
}
</style>
