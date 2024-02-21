<template>
  <!--进度条拖动-->
  <div ref="mmProgress" class="mmProgress" @click="barClick">
<!--    进度条槽-->
    <div class="mmProgress-bar"></div>
<!--    缓冲进度-->
    <div ref="mmPercentProgress" class="mmProgress-outer"></div>
<!--    音乐进度-->
    <div ref="mmProgressInner" class="mmProgress-inner">
      <div class="mmProgress-dot" @mousedown="barDown" @touchstart.prevent="barDown"></div>
    </div>
  </div>
</template>

<script>
import {mapMutations} from "vuex";

const dotWidth = 10
export default {
  name: 'MmProgress',
  props: {
    // 进度值一
    percent: {
      type: [Number],
      default: 0,
    },
    // 进度值二（歌曲缓冲进度用）
    percentProgress: {
      type: [Number],
      default: 0,
    },
  },
  data() {
    return {
      move: {
        status: false, // 是否可拖动
        startX: 0, // 记录最开始点击的X坐标
        left: 0, // 记录当前已经移动的距离
        beenBuffered: 0,
        //targetBuffered: 0, //尝试手动实现"拖动进度条超过加载部分时暂停播放,并推进缓存然后在目标位置继续播放", 但是失败了
      },
    }
  },
  watch: {
    percent(newPercent) {
      if (newPercent >= 0 && !this.move.status) {
        const barWidth = this.$refs.mmProgress.clientWidth - dotWidth
        const offsetWidth = newPercent * barWidth
        this.moveSilde(offsetWidth)
      }
    },
    percentProgress(newValue) {
      this.beenBuffered = newValue
      /*// //console.log('percentProgress= ', newValue) //在music.vue中传过来的
      //console.log('this.targetBuffered ', this.targetBuffered)
      //console.log('this.beenBuffered ', this.beenBuffered)
      if (this.targetBuffered && this.targetBuffered !== 0) {
        // 还没有缓存到目标进度, 需要继续向前缓存
        this.commitPercent(true)
        // 判断本次缓存是否到达目标值
        if (this.targetBuffered - newValue <= 0) {
          // 到达缓存目标值就清除任务
          //console.log("清除任务")
          this.setPlaying(true)
          this.targetBuffered = 0
        }
      }*/
      let offsetWidth = this.$refs.mmProgress.clientWidth * newValue
      this.$refs.mmPercentProgress.style.width = `${offsetWidth}px`
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.bindEvents()
      const barWidth = this.$refs.mmProgress.clientWidth - dotWidth
      const offsetWidth = this.percent * barWidth
      this.moveSilde(offsetWidth)
    })
  },
  beforeDestroy() {
    this.unbindEvents()
  },
  methods: {
    // 添加绑定事件
    bindEvents() {
      document.addEventListener('mousemove', this.barMove)
      document.addEventListener('mouseup', this.barUp)

      document.addEventListener('touchmove', this.barMove)
      document.addEventListener('touchend', this.barUp)
    },
    // 移除绑定事件
    unbindEvents() {
      document.removeEventListener('mousemove', this.barMove)
      document.removeEventListener('mouseup', this.barUp)

      document.removeEventListener('touchmove', this.barMove)
      document.removeEventListener('touchend', this.barUp)
    },
    // 点击事件
    barClick(e) {
      let rect = this.$refs.mmProgress.getBoundingClientRect()
      let offsetWidth = Math.min(
        this.$refs.mmProgress.clientWidth - dotWidth,
        Math.max(0, e.clientX - rect.left),
      )
      this.moveSilde(offsetWidth)
      this.commitPercent(true)
    },
    // 鼠标按下事件
    barDown(e) {
      //鼠标移动是一直监测的,只有当鼠标按下bar时才修改进度
      this.move.status = true
      this.move.startX = e.clientX || e.touches[0].pageX
      this.move.left = this.$refs.mmProgressInner.clientWidth
    },
    // 鼠标/触摸移动事件
    barMove(e) {

      if (!this.move.status) {
        return false
      }
      e.preventDefault()
      let endX = e.clientX || e.touches[0].pageX
      let dist = endX - this.move.startX
      let offsetWidth = Math.min(
        this.$refs.mmProgress.clientWidth - dotWidth,
        Math.max(0, this.move.left + dist),
      )
      this.moveSilde(offsetWidth)
      this.commitPercent()
    },
    // 鼠标/触摸释放事件
    barUp(e) {
      if (this.move.status) {
        this.commitPercent(true)
        this.move.status = false
      }
    },
    // 移动滑块
    moveSilde(offsetWidth) {
      this.$refs.mmProgressInner.style.width = `${offsetWidth}px`
    },
    // 修改 percent, isEnd表示释放鼠标,要在释放出开始播放
    commitPercent(isEnd = false) {

      const { mmProgress, mmProgressInner } = this.$refs
      const lineWidth = mmProgress.clientWidth - dotWidth
      // percent是当前要达到的进度百分比
      let percent = mmProgressInner.clientWidth / lineWidth

      /*if (this.targetBuffered && this.targetBuffered !== 0) {
        percent = this.targetBuffered
      }
      // canProgress用于记录进度条最终前进百分比
      let canProgress = percent
      //console.log("向前缓存,percent= ", percent)
      if (percent >= this.beenBuffered) {
        // 虽然当前缓存了beenBuffered, 但是为了防止小数点太多导致进度条重点超过beenBuffered, 采用向下取整可以避免
        canProgress = Math.floor(this.beenBuffered * 1000) / 1000.0
        this.targetBuffered = percent
        this.setPlaying(false)
        this.$mmToast('加速缓存ing')
      }
      this.$emit(isEnd ? 'percentChangeEnd' : 'percentChange', canProgress)*/
      // 禁止进度条超过已加载部分, 超过时就将进度拉到当前缓存的终点
      /*if (percent >= this.beenBuffered) {
        percent = Math.floor(this.beenBuffered * 1000) / 1000.0
      }*/
      this.$emit(isEnd ? 'percentChangeEnd' : 'percentChange', percent)
    },
   /* ...mapMutations({
      setPlaying: 'SET_PLAYING',
    }),*/
  },
}
</script>

<style lang="less">
.mmProgress {
  position: relative;
  padding: 5px;
  user-select: none;
  cursor: pointer;
  overflow: hidden;
  .mmProgress-bar {
    height: 2px;
    width: 100%;
    background: @bar_color;
  }
  .mmProgress-outer {
    position: absolute;
    top: 50%;
    left: 5px;
    display: inline-block;
    width: 0;
    height: 2px;
    margin-top: -1px;
    background: rgb(242, 245, 244);
  }
  .mmProgress-inner {
    position: absolute;
    top: 50%;
    left: 5px;
    display: inline-block;
    width: 0;
    height: 2px;
    margin-top: -1px;
    background: @line_color;
    .mmProgress-dot {
      position: absolute;
      top: 50%;
      right: -5px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: @dot_color;
      transform: translateY(-50%);
    }
  }
}
</style>
