import { PLAY_MODE } from '@/config'

// 重试次数
let retry = 1

const mmPlayerMusic = {
  initAudio(that) {
    const ele = that.audioEle
    // 音频缓冲事件
    ele.onprogress = () => {
      try {
        if (ele.buffered.length > 0) {
          const duration = that.currentMusic.duration
          let buffered = 0
          ele.buffered.end(0)
          buffered = ele.buffered.end(0) > duration ? duration : ele.buffered.end(0)
          that.currentProgress = buffered / duration
        }
      } catch (e) {}
    }
    // 开始播放音乐
    ele.onplay = () => {
      let timer
      clearTimeout(timer)
      timer = setTimeout(() => {
        that.musicReady = true
      }, 100)
    }
    // 获取当前播放时间
    ele.ontimeupdate = () => {
      that.currentTime = ele.currentTime
    }
    // 当前音乐播放完毕
    ele.onended = () => {
      if (that.mode === PLAY_MODE.LOOP) {
        that.loop()
      } else {
        that.next()
      }
    }
    // 音乐播放出错
    ele.onerror = () => {
      if (retry === 0) {
        let toastText = '当前音乐不可播放，已自动播放下一曲'
        if (that.playlist.length === 1) {
          toastText = '没有可播放的音乐哦~'
        }
        that.$mmToast(toastText)
        that.next(true)
      } else {
        // eslint-disable-next-line no-console
        console.log('重试一次')
        retry -= 1
        ele.url = that.currentMusic.url
        ele.load()
      }
      // console.log('播放出错啦！')
    }
    // 音乐进度拖动大于加载时重载音乐
    ele.onstalled = () => {
      ele.load()
      that.setPlaying(false)
      let timer
      clearTimeout(timer)
      timer = setTimeout(() => {
        that.setPlaying(true)
      }, 10)
    }
    // 将能播放的音乐加入播放历史
    ele.oncanplay = () => {
      retry = 1
      if (that.historyList.length === 0 || that.currentMusic.id !== that.historyList[0].id) {
        that.setHistory(that.currentMusic)
      }
    }
    // 音频数据不可用时
    ele.onstalled = () => {
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
  }
}

export default mmPlayerMusic
