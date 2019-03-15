<template>
  <!--选项-->
  <div class="music-btn">
    <router-link to="/music/playlist" tag="span">正在播放</router-link>
    <router-link to="/music/toplist" tag="span">推荐</router-link>
    <router-link to="/music/search" tag="span">搜索</router-link>
    <router-link class="none-414" to="/music/userlist" tag="span">我的歌单</router-link>
    <router-link to="/music/historylist" tag="span">我听过的</router-link>
    <span class="music-btn" to="/music/sync" tag="span" @click="openDialog(0)">同步</span>
    <mm-dialog
      ref="syncDialog"
      headText="音乐同步设置"
      confirmBtnText="提交"
      cancelBtnText="关闭"
      @confirm="submit"
    >
      <div class="mm-dialog-text">
        <input
          class="mm-dialog-input"
          v-show="!showInput"
          type="number"
          autofocus
          placeholder="这里输入对方编号同步对方歌曲"
          v-model.trim="dest"
          @keyup.enter="submit"
        >
        <p v-show="uid">
          <input v-model="showInput" type="checkbox" name="openroom" value="openroom">开启房间
        </p>
        <p v-if="uid">开启之后,您的另外一半输入您的的编号即可自动同步您的进度.</p>
        <p v-else>您必须先要登录才能开启房间,你现在只能同步其他人的房间.</p>
        <p v-if="uid" v-text="'您当前的编号为:'"></p>
        <p v-if="uid" v-text="{uid}"></p>
      </div>
      <div slot="btn" @click="openDialog(1)">帮助</div>
    </mm-dialog>
  </div>
</template>

<script>
import MmDialog from "base/mm-dialog/mm-dialog";
import {
  setSyncStatus,
  setSyncDest,
  getSyncDest,
  getSyncStatus
} from "assets/js/storage.js";
import { mapGetters, mapActions } from "vuex";
export default {
  name: "music-btn",
  data() {
    return {
      user: this.uid,
      showInput: false,
      dest: ""
    };
  },
  components: {
    MmDialog
  },
  computed: {
    ...mapGetters(["uid"])
  },
  methods: {
    created() {},
    openDialog(key) {
      switch (key) {
        case 0:
          this.$refs.syncDialog.show();
          var sync = getSyncStatus();
          console.log("获取的状态为" + sync);
          var dest = getSyncDest();
          console.log(dest);
          if (sync === undefined) {
            this.showInput = false;
          } else {
            if (sync === "true") {
              this.showInput = true;
            } else {
              this.showInput = false;
            }
          }
          if (dest === undefined) {
            this.dest = "";
          } else {
            this.dest = dest;
          }
          break;
      }
    },
    submit() {
      console.log("获取的内容:" + getSyncStatus());
      //   console.log(this.uid);
      //   //用户进行提交
      //   console.log(this.dest)
      console.log(this.showInput);
      setSyncStatus(this.showInput);
      setSyncDest(this.dest);
      console.log(getSyncStatus());
      this.$router.go(0);
    },
    updated() {
      if (this.uid != null) {
        this.isLogin = true;
      }
    },
    ...mapActions(["setSync"])
  }
};
</script>

<style lang="less" scoped>
.music-btn {
  height: 60px;
  font-size: 0;
  span {
    display: inline-block;
    height: 40px;
    box-sizing: border-box;
    margin-right: 8px;
    padding: 0 23px;
    border: 1px solid @btn_color;
    color: @btn_color;
    border-radius: 2px;
    font-size: 14px;
    line-height: 40px;
    overflow: hidden;
    cursor: pointer;
    &:hover,
    &.active {
      border-color: @btn_color_active;
      color: @btn_color_active;
    }
  }
  @media (max-width: 768px) {
    height: 50px;
    span {
      height: 35px;
      padding: 0 10px;
      margin-right: 6px;
      line-height: 35px;
      &:nth-last-of-type(1) {
        margin: 0;
      }
      @media (max-width: 413px) {
        &.none-414 {
          display: none;
        }
      }
    }
  }
}
</style>
