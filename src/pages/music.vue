<template>
  <div class="music">
    <div class="music-content">
      <div class="music-left">
        <music-btn/>
        <keep-alive>
          <router-view v-if="$route.meta.keepAlive" class="music-list"/>
        </keep-alive>
        <router-view :key="$route.path" v-if="!$route.meta.keepAlive" class="music-list"/>
      </div>
      <lyric class="music-right" :lyric="lyric" :nolyric="nolyric" :lyricIndex="lyricIndex"/>
    </div>

    <!--播放器-->
    <div class="music-bar" :class="{disable:!musicReady||!currentMusic.id}">
      <div class="music-bar-btns">
        <i class="bar-icon btn-prev" title="上一曲 Ctrl + Left" @click="prev"></i>
        <i
          class="bar-icon btn-play"
          :class="{'btn-play-pause':playing}"
          title="播放暂停 Ctrl + Space"
          @click="play"
        ></i>
        <i class="bar-icon btn-next" title="下一曲 Ctrl + Right" @click="next"></i>
      </div>
      <div class="music-music">
        <div class="music-bar-info">
          <template v-if="currentMusic&&currentMusic.id">
            {{currentMusic.name}}
            <span>- {{currentMusic.singer}}</span>
          </template>
          <template v-else>同步音乐是一款可以使身处异地的恋人能够同时听到相同进度的歌曲播放器</template>
        </div>
        <div
          class="music-bar-time"
          v-if="currentMusic.id"
        >{{currentTime | format}}/{{currentMusic.duration | formatDuration}}</div>
        <mm-progress
          class="music-progress"
          :percent="percentMusic"
          :percentProgress="currentProgress"
          @percentChange="progressMusic"
        />
      </div>
      <i class="bar-icon btn-mode" :class="modeClass" :title="modeTitle" @click="modeChange"></i>
      <i class="bar-icon btn-comment" @click="openComment"></i>
      <div class="music-bar-volume" title="音量加减 [Ctrl+Up/Down]">
        <i class="bar-icon btn-volume" :class="{'btn-volume-no':isMute}" @click="switchMute"></i>
        <mm-progress @percentChange="volumeChange" :percent="volume"/>
      </div>
    </div>

    <!--遮罩-->
    <div class="mmPlayer-bg" :style="{backgroundImage: picUrl}"></div>
    <div class="mmPlayer-mask"></div>
  </div>
</template>

<script>
import { getLyric, getCheckMusic, getMusicDetail } from "api";
import mmPlayerMusic from "./mmPlayer";
import { randomSortArray, addZero, parseLyric } from "assets/js/util";
import { playMode, defaultBG } from "assets/js/config";
import { mapGetters, mapMutations, mapActions } from "vuex";
import MusicBtn from "components/music-btn/music-btn";
import Lyric from "components/lyric/lyric";
import MmProgress from "base/mm-progress/mm-progress";
import MmDialog from "base/mm-dialog/mm-dialog";
import {
  setSyncStatus,
  setSyncDest,
  getSyncDest,
  getSyncStatus
} from "assets/js/storage.js";

export default {
  name: "music",
  components: {
    Lyric,
    MusicBtn,
    MmDialog,
    MmProgress
  },
  data() {
    return {
      musicReady: false, //是否可以使用播放器
      currentTime: 0, //当前播放时间
      currentProgress: 0, //当前缓冲进度
      lyric: [], //歌词
      nolyric: false, //是否有歌词
      lyricIndex: 0, //当前播放歌词下标
      isMute: false, //是否静音
      volume: 1, //默认音量大小
      websock: null, //websocket
      timer: null, //用于心跳包的发送.
      self:this
    };
  },
  mounted() {
    this.$nextTick(() => {
      mmPlayerMusic.initAudio(this);
      this.keyDown();
    });
  },
  computed: {
    picUrl() {
      return this.currentMusic.id && this.currentMusic.image
        ? `url(${this.currentMusic.image}?param=300y300)`
        : `url(${defaultBG})`;
    },
    modeClass() {
      switch (this.mode) {
        case playMode.listLoop:
          return "mode-listLoop";
        case playMode.order:
          return "mode-order";
        case playMode.random:
          return "mode-random";
        case playMode.loop:
          return "mode-loop";
      }
    },
    modeTitle() {
      let key = "Ctrl + O";
      switch (this.mode) {
        case playMode.listLoop:
          return `列表循环 ${key}`;
        case playMode.order:
          return `顺序播放 ${key}`;
        case playMode.random:
          return `随机播放 ${key}`;
        case playMode.loop:
          return `单曲循环 ${key}`;
      }
    },
    percentMusic() {
      const duration = this.currentMusic.duration;
      return this.currentTime && duration ? this.currentTime / duration : 0;
    },
    ...mapGetters([
      "audioEle",
      "mode",
      "playing",
      "playlist",
      "orderList",
      "currentIndex",
      "currentMusic",
      "historyList",
      "uid"
    ])
  },
  watch: {
    currentMusic(newMusic, oldMusic) {
      if (!newMusic.id) {
        this.lyric = [];
        return;
      }
      if (newMusic.id === oldMusic.id) {
        return;
      }
      this.audioEle.src = newMusic.url;
      //重置相关参数
      this.lyricIndex = this.currentTime = this.percentMusic = this.currentProgress = 0;
      try {
        this.audioEle.play().catch(function(e) {});
      } catch (e) {}
      this.$nextTick(() => {
        this._getLyric(newMusic.id);
      });
      var self =this;
      this.sync();
    },
    playing(newPlaying) {
      const audio = this.audioEle;
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause();
        this.musicReady = true;
      });
     this.sync();
    },
    currentTime(newTime) {
      if (this.nolyric) {
        return;
      }
      let lyricIndex = 0;
      for (let i = 0; i < this.lyric.length; i++) {
        if (newTime > this.lyric[i].time) {
          lyricIndex = i;
        }
      }
      this.lyricIndex = lyricIndex;
    }
  },
  methods: {
    //按键事件
    keyDown() {
      document.onkeydown = e => {
        switch (e.ctrlKey && e.keyCode) {
          case 32: //播放暂停Ctrl + Space
            this.play();
            break;
          case 37: //上一曲Ctrl + Left
            this.prev();
            break;
          case 38: //音量加Ctrl + Up
            let plus = Number((this.volume += 0.1).toFixed(1));
            if (plus > 1) {
              plus = 1;
            }
            this.volumeChange(plus);
            break;
          case 39: //下一曲Ctrl + Right
            this.next();
            break;
          case 40: //音量减Ctrl + Down
            let reduce = Number((this.volume -= 0.1).toFixed(1));
            if (reduce < 0) {
              reduce = 0;
            }
            this.volumeChange(reduce);
            break;
          case 79: //切换播放模式Ctrl + O
            this.modeChange();
            break;
        }
      };
    },
    //上一曲
    prev() {
      if (!this.musicReady) {
        return;
      }
      if (this.playlist.length === 1) {
        this.loop();
      } else {
        let index = this.currentIndex - 1;
        if (index < 0) {
          index = this.playlist.length - 1;
        }
        this.setCurrentIndex(index);
        if (!this.playing && this.musicReady) {
          this.setPlaying(true);
        }
        this.musicReady = false;
      }
    },
    //播放暂停
    play() {
      if (!this.musicReady) {
        return;
      }
      this.setPlaying(!this.playing);
    },
    //下一曲
    next() {
      if (!this.musicReady) {
        return;
      }
      if (
        this.playlist.length - 1 === this.currentIndex &&
        this.mode === playMode.order
      ) {
        this.setCurrentIndex(-1);
        this.setPlaying(false);
        return;
      }
      if (this.playlist.length === 1) {
        this.loop();
      } else {
        let index = this.currentIndex + 1;
        if (index === this.playlist.length) {
          index = 0;
        }
        if (!this.playing && this.musicReady) {
          this.setPlaying(true);
        }
        this.setCurrentIndex(index);
        this.musicReady = false;
      }
    },
    //循环
    loop() {
      this.audioEle.currentTime = 0;
      this.audioEle.play();
      this.setPlaying(true);
      if (this.lyric.length > 0) {
        this.lyricIndex = 0;
      }
    },
    //修改音乐进度
    progressMusic(percent) {
      this.audioEle.currentTime = this.currentMusic.duration * percent;
      this.sync();
    },
    sync(){
        if (getSyncStatus() !== "true") {
            return;
        }
        var self = this;
         self.websock.send(
              JSON.stringify({
                code: 600,
                id: self.uid,
                songid: self.currentMusic.id,
                currentTime: self.audioEle.currentTime,
                album: self.currentMusic.album,
                duration: self.currentMusic.duration,
                image: self.currentMusic.image,
                name: self.currentMusic.name,
                singer: self.currentMusic.singer,
                url: self.currentMusic.url,
                play: self.playing,
                timestamp: new Date().valueOf()
              })
        );
        console.log("立即更新数据..")
    },
    changeCurrentTime(time) {
      this.audioEle.currentTime = time;
    },
    //切换播放顺序
    modeChange() {
      const mode = (this.mode + 1) % 4;
      this.setPlayMode(mode);
      if (mode === playMode.loop) {
        return;
      }
      let list = [];
      switch (mode) {
        case playMode.listLoop:
          list = this.orderList;
          break;
        case playMode.order:
          list = this.orderList;
          break;
        case playMode.random:
          list = randomSortArray(this.orderList);
          break;
      }
      this.resetCurrentIndex(list);
      this.setPlaylist(list);
    },
    // 修改当前歌曲索引
    resetCurrentIndex(list) {
      const index = list.findIndex(item => {
        return item.id === this.currentMusic.id;
      });
      this.setCurrentIndex(index);
    },
    //打开音乐评论
    openComment() {
      if (!this.currentMusic.id) {
        this.$mmToast("还没有播放歌曲哦！");
        return false;
      }
      this.$router.push(`/music/comment/${this.currentMusic.id}`);
    },
    //修改音量大小
    volumeChange(percent) {
      percent === 0 ? (this.isMute = true) : (this.isMute = false);
      this.volume = percent;
      this.audioEle.volume = percent;
    },
    //是否静音
    switchMute() {
      const audio = this.audioEle;
      this.isMute = !this.isMute;
      this.isMute ? (audio.volume = 0) : (audio.volume = this.volume);
    },
    //获取歌词
    _getLyric(id) {
      getLyric(id).then(res => {
        if (res.status === 200) {
          if (res.data.nolyric) {
            this.nolyric = true;
          } else {
            this.nolyric = false;
            this.lyric = parseLyric(res.data.lrc.lyric);
          }
          this.audioEle.play();
        }
      });
    },
    ...mapMutations({
      setPlaying: "SET_PLAYING",
      setPlaylist: "SET_PLAYLIST",
      setCurrentIndex: "SET_CURRENTINDEX",
    }),
    ...mapActions(["setHistory", "setPlayMode","selectAddPlay"])
  },
  created() {
    // const wsuri = "ws://127.0.0.1:12345/" + this.uid; //这个地址由后端童鞋提供
    const wsuri = "ws://129.204.108.71:12345/" + this.uid; //这个地址由后端童鞋提供

    var self = this;
    this.websock = new WebSocket(wsuri);
    this.websock.onmessage = function(e) {
      var responed = JSON.parse(e.data);
      if (getSyncStatus() === "true") {
        //表示现在是房主,后续需要添加新的标识符改掉这里
        if (responed.code == 200) {
          //说明请求一切正常.开房成功
          //this.$mmToast("开启同步完成!");
          //每隔十秒钟进行一次心跳请求.
          this.timer = setInterval(function() {
            self.websock.send(
              JSON.stringify({
                code: 600,
                id: self.uid,
                songid: self.currentMusic.id,
                currentTime: self.audioEle.currentTime,
                album: self.currentMusic.album,
                duration: self.currentMusic.duration,
                image: self.currentMusic.image,
                name: self.currentMusic.name,
                singer: self.currentMusic.singer,
                url: self.currentMusic.url,
                play: self.playing,
                timestamp: new Date().valueOf()
              })
            );
          }, 10000);
        } else if (responed.code === 400) {
          //说明服务器已经开启了房间了,不能在开启了.
          console.log("房间已经有人开启了.");
        }
      } else {
        //表示不是房主,需要同步其他用户的数据
        if (responed.code === 500) {
          //说明没有房间.
          console.log("没有找到房间!");
        } else if (responed.code === 200) {
          //表示一切正常,有房间
          console.log("正常加入房间,准备同步房主数据!");
        } else if (responed.code === 600) {
          console.log("接收到数据:" + responed);
          console.log(self.currentMusic.id)
          console.log(responed.songid)
          if (self.currentMusic.id !== responed.songid) {
            //首先判断房主播放的歌曲是否还是一样的
            //如果是一样的话,表示是歌曲发生了变化.
            var music = {
              album: responed.album,
              duration: responed.duration,
              id: responed.songid,
              image: responed.image,
              name: responed.name,
              singer: responed.singer,
              url: responed.url
            };
            console.log(music)
            // self.currentMusic.album = responed.album;
            // self.currentMusic.id = responed.songid;
            // self.currentMusic.image = responed.image;
            // self.currentMusic.name = responed.name;
            // self.currentMusic.singer = responed.singer;
            // self.currentMusic.url = responed.url;
            self.selectAddPlay(music);
            self.setPlaying(false);
            self.setPlaying(true);

          }
          //计算进度是否发生了变化.
          var duringTime = (new Date().valueOf() - responed.timestamp) / 1000;
          //计算经过了多少的传输时间加上进度
          var accuteDuration = responed.currentTime + duringTime;
          if (accuteDuration > self.currentMusic.duration) {
            //如果时间已经超过这首歌的总长度说明房主应该已经切换到了下一首了.这里直接进行暂停.等待同步数据
            self.setPlaying(false);
          } else if (Math.abs(self.audioEle.currentTime - accuteDuration) > 3) {
            //如果目前两者的播放进度小于3秒的话那么就不直接跳转了.太精确容易导致卡顿
            self.changeCurrentTime(accuteDuration);
          }
          if (responed.play === true) {
            //说明还在播放.
            if (
              accuteDuration < self.currentMusic.duration &&
              self.playing === false
            ) {
              self.setPlaying(true);
            }
          } else {
            if (self.playing === true) {
              self.setPlaying(false);
            }
          }
        }
      }
    };
    this.websock.onopen = function(e) {
      //发送当前的用户id到服务器
      console.log("连接到服务器成功~");
      if (getSyncStatus() === "true") {
        //表示当前是房主
        self.websock.send(
          JSON.stringify({
            code: 100,
            id: self.uid
          })
        );
      } else if (
        getSyncDest() !== undefined &&
        getSyncDest() !== null &&
        getSyncDest() !== ""
      ) {
        //如果dest目标不是为空的话.就发送到服务器请求连接.
        console.log("听众尝试连接到服务器");
        self.websock.send(
          JSON.stringify({
            code: 200,
            id: getSyncDest()
          })
        );
      }
    };
    this.websock.onerror = function(e) {
      //关闭计时器
      stopInterval(this.timer);
    };
    this.websock.onclose = function(e) {
      //关闭计时器
      stopInterval(this.timer);
    };
  },
  filters: {
    //时间格式化
    format(value) {
      let minute = Math.floor(value / 60);
      let second = Math.floor(value % 60);
      return `${addZero(minute)}:${addZero(second)}`;
    },
    formatDuration(value) {
      let other = value % 3600;
      let minutes = Math.floor(other / 60);
      let seconds = Math.floor(other % 60);
      return addZero(minutes) + ":" + addZero(seconds);
    }
  },
  destroyed() {
    // this.websocketclose();
  }
};
</script>

<style lang="less">
.music {
  padding: 75px 25px 25px 25px;
  width: 100%;
  max-width: 1750px;
  margin: 0 auto;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  .music-content {
    display: flex;
    width: 100%;
    height: calc(~"100% - 80px");
    .music-left {
      flex: 1;
      height: 100%;
      overflow: hidden;
      .music-list {
        height: calc(~"100% - 60px");
      }
    }
    .music-right {
      position: relative;
      width: 310px;
      margin-left: 10px;
    }
  }

  /*底部mmPlayer-bar*/
  .music-bar {
    display: flex;
    align-items: center;
    width: 100%;
    height: 80px;
    box-sizing: border-box;
    padding-bottom: 15px;
    &.disable {
      pointer-events: none;
      opacity: 0.6;
    }
    .bar-icon {
      display: block;
      background-image: url("~assets/img/player.png");
      cursor: pointer;
    }
    .music-bar-btns {
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
    .btn-prev {
      width: 19px;
      min-width: 19px;
      height: 20px;
      background-position: 0 -30px;
    }
    .btn-play {
      width: 21px;
      min-width: 21px;
      height: 29px;
      margin: 0 50px;
      background-position: 0 0;
      &.btn-play-pause {
        background-position: -30px 0;
      }
    }
    .btn-next {
      width: 19px;
      min-width: 19px;
      height: 20px;
      background-position: 0 -52px;
    }
    .music-music {
      position: relative;
      width: 100%;
      flex: 1;
      box-sizing: border-box;
      padding-left: 50px;
      font-size: @font_size_small;
      color: @text_color_active;
      .music-bar-info {
        height: 15px;
        padding-right: 80px;
        line-height: 15px;
        text-overflow: ellipsis;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      .music-bar-time {
        position: absolute;
        top: 0;
        right: 5px;
      }
    }
    .mode-listLoop {
      width: 26px;
      height: 25px;
      margin-left: 20px;
      background-position: 0 -205px;
    }
    .mode-order {
      width: 23px;
      height: 20px;
      margin-left: 23px;
      background-position: 0 -260px;
    }
    .mode-random {
      width: 25px;
      height: 19px;
      margin-left: 21px;
      background-position: 0 -74px;
    }
    .mode-loop {
      width: 26px;
      height: 25px;
      margin-left: 20px;
      background-position: 0 -232px;
    }
    .btn-comment {
      width: 24px;
      height: 24px;
      margin-left: 20px;
      background-position: 0 -400px;
    }
    .music-bar-volume {
      position: relative;
      margin-left: 20px;
      .btn-volume {
        width: 26px;
        height: 21px;
        background-position: 0 -144px;
        &.btn-volume-no {
          background-position: 0 -182px;
        }
      }
      @media (min-width: 768px) {
        width: 150px;
        .btn-volume {
          position: absolute;
          top: -4px;
        }

        .mmProgress {
          margin-left: 30px;
        }
      }
      @media (max-width: 768px) {
        top: 2px;
        width: 26px;
        height: 21px;
      }
    }
  }

  /*遮罩*/
  .mmPlayer-mask,
  .mmPlayer-bg {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
  }

  .mmPlayer-mask {
    z-index: -1;
    background-color: @mask_color;
  }

  .mmPlayer-bg {
    z-index: -2;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50%;
    filter: blur(12px);
    opacity: 0.7;
    transform: translateZ(0);
    transition: all 0.8s;
  }

  //当屏幕小于960时
  @media (max-width: 960px) {
    .music-right {
      display: none;
    }
  }
  //当屏幕小于768时
  @media (max-width: 768px) {
    & {
      padding: 75px 15px 5px 15px;
    }

    .music-content .music-left {
      .music-list {
        font-size: @font_size_medium;
      }
    }

    .music-bar {
      .music-bar-info span,
      .music-bar-volume .mmProgress {
        display: none;
      }
    }
  }
  //当屏幕小于520时
  @media (max-width: 520px) {
    .music-bar {
      position: relative;
      flex-direction: column;
      .music-bar-btns {
        width: 60%;
        margin-top: 15px;
        order: 2;
      }
      .music-music {
        padding-left: 0;
        order: 1;
      }
      & > i.btn-mode {
        position: absolute;
        top: 44px;
        left: 5px;
        margin: 0;
      }
      .btn-comment {
        position: absolute;
        top: 45px;
        right: 5px;
        width: 26px;
        height: 21px;
      }
      .music-bar-volume {
        display: none;
      }
    }
  }
}
</style>
