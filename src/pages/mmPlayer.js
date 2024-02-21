import { PLAY_MODE } from '@/config'

// 重试次数
let retry = 1
window.tryMusicId = ''

// 下面是在给audio元素绑定事件的回调函数. 这些事件大多是自动触发的.
//触发这些事件的函数有: audio.play()/pause()/load()
const mmPlayerMusic = {
  initAudio(that) {
    const ele = that.audioEle
    // 音频缓冲事件
    ele.onprogress = () => {
      try {
        if (ele.buffered.length > 0) {
          const duration = that.currentMusic.duration
          const buffered2 = ele.buffered;
          const rangesCount = buffered2.length;
          /*for (let i = 0; i < rangesCount; i++) {
            // 获取每个缓冲时间范围的起始点和结束点
            const start = buffered2.start(i);
            const end = buffered2.end(i);
            //console.log(`缓冲范围 ${i + 1}: 开始时间 ${start}, 结束时间 ${end}`);
          }*/
          let totalBuffered = buffered2.end(rangesCount - 1)
          ////console.log('totalBuffered=', totalBuffered)
          that.currentProgress = totalBuffered / duration
          /*
          //原项目的代码:
          let buffered = 0
          // ele.buffered.end(0)没看懂作用
          ele.buffered.end(0)
          buffered = ele.buffered.end(0) > duration ? duration : ele.buffered.end(0)
          // //console.log('buffered=', buffered / duration)
          ////console.log('duration=' ,duration)
          //console.log('ele.buffered.end(0)= ', ele.buffered.end(0)) //单位是s
          //console.log('buffered= ', buffered) //单位是s
          // //console.log(typeof duration)
          that.currentProgress = buffered / duration*/
        }
      } catch (e) {}
    }
    // 开始播放音乐
    ele.onplay = () => {
      //console.log('ele.onplay')
      let timer
      clearTimeout(timer)
      timer = setTimeout(() => {
        that.musicReady = true
      }, 100)
    }
    // 获取当前播放时间
    ele.ontimeupdate = () => {
      //console.log('ele.ontimeupdate')
      that.currentTime = ele.currentTime
    }
    // 当前音乐播放完毕
    ele.onended = () => {
      //console.log('ele.onended')
      if (that.mode === PLAY_MODE.LOOP) {
        that.loop()
      } else {
        that.next()
      }
    }
    ele.onerror = (t) => {
      if (retry === 1) {
        //console.log('!!!!!!!!!!!!!! 第一次使用的url')
      }
      if (retry >= 3) {
        let toastText = '当前音乐源全部尝试, 不可播放，已自动播放下一曲'
        //console.log('当前音乐源全部尝试, 不可播放，已自动播放下一曲')
        if (that.playlist.length === 1) {
          toastText = '歌单只有一首, 没有可播放的音乐了~'
        }
        that.$mmToast(toastText)
        retry = 1
        // that.next(true)
      } else {
        // eslint-disable-next-line no-console
        //console.log('!!!!!!!!!!!!!! 重试,  第', retry + 1, " 个url")
        ele.load()
        retry += 1
      }
      // //console.log('播放出错啦！')
    }

    // 音乐播放出错 -- 在MDN没有看到该事件,但是能用
    ele.onerror_Old = (t) => {
      //console.log("------------ onerror")
      //console.log(that.currentMusic)
      if (retry === 1) {
        //console.log('!!!!!!!!!!!!!! 第一次使用的url')
        //console.log(that.currentMusic.urls[0].substring(that.currentMusic.urls[0].length - 25, that.currentMusic.urls[0].length - 10))
      }
      const urlsLength = that.currentMusic.urls.length
      if (retry >= urlsLength) {
        let toastText = '当前音乐源全部尝试, 不可播放，已自动播放下一曲'
        //console.log('当前音乐源全部尝试, 不可播放，已自动播放下一曲')

        // (b站音频无法播放)解决方案一: (安装更改referer的插件)打开新窗口. 此时可以播放, 但是无法下载.
        //window.open(that.currentMusic.urls[0])

        if (that.playlist.length === 1) {
          toastText = '歌单只有一首, 没有可播放的音乐了~'
        }
        that.$mmToast(toastText)
        retry = 1

        // (b站音频无法播放)解决方案二: 跳到下一首
        // that.next(true)
      } else {
        // eslint-disable-next-line no-console
        //console.log('!!!!!!!!!!!!!! 重试,  第', retry + 1, " 个url")
        //console.log(that.currentMusic.urls[retry].substring(that.currentMusic.urls[retry].length - 25, that.currentMusic.urls[retry].length - 10))
        //that.currentMusic.canUrls.push(that.currentMusic.urls[retry])
        // ele.urls = that.currentMusic.urls[retry]
        ele.src = that.currentMusic.urls[retry]
        //console.log('change url')
        //console.dir(ele)
        ele.load()
        ele.play()
        retry += 1
      }
      // //console.log('播放出错啦！')
    }
    // 音乐进度拖动大于加载时重载音乐 -- 这个描述应该不对

    ele.onstalled = () => {
      //console.log('ele.onstalled #1')
      ele.load()
      that.setPlaying(false)
      let timer
      clearTimeout(timer)
      timer = setTimeout(() => {
        //console.log('ele.onstalled #1')
        that.setPlaying(true)
      }, 10)
    }
    // 将能播放的音乐加入播放历史
    ele.oncanplay = () => {
      //console.log('ele.oncanplay')
      retry = 1
      // 这里影响了听歌历史的排列, 因为它固定和第一个进行比较
      if (that.historyList.length === 0 || that.currentMusic.id !== that.historyList[0].id) {
        that.setHistory(that.currentMusic)
      }
    }
    // 音频数据不可用时
    ele.onstalled = () => {
      //console.log('ele.onstalled')
      ele.load()
      that.setPlaying(false)
      let timer
      clearTimeout(timer)
      timer = setTimeout(() => {
        that.setPlaying(true)
      }, 10)
    }
    // 当音频已暂停时
    ele.onpause = () => {
      that.setPlaying(false)
    }
  },
}

export default mmPlayerMusic
