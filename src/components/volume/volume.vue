<!-- 音量控制组件 -->
<template>
  <div class="volume">
    <mm-icon
      class="pointer volume-icon"
      :type="getVolumeIconType()"
      :size="30"
      @click="handleToggleVolume"
    />
    <div class="volume-progress-wrapper">
      <mm-progress
        :percent="volumeProgress"
        @percentChangeEnd="handleVolumeChange"
        @percentChange="handleVolumeChange"
      />
    </div>
  </div>
</template>

<script>
import MmProgress from 'base/mm-progress/mm-progress'

export default {
  name: 'Volume',
  components: {
    MmProgress
  },
  props: {
    volume: {
      type: Number,
      required: true
    }
  },
  computed: {
    volumeProgress() {
      return this.volume
    },
    isMute: {
      get() {
        return this.volumeProgress === 0
      },
      set(newMute) {
        const volume = newMute ? 0 : this.lastVolume
        if (newMute) {
          this.lastVolume = this.volumeProgress
        }
        this.handleVolumeChange(volume)
      }
    }
  },
  methods: {
    getVolumeIconType() {
      return this.isMute ? 'volume-off' : 'volume'
    },
    // 是否静音
    handleToggleVolume() {
      this.isMute = !this.isMute
    },
    handleVolumeChange(percent) {
      this.$emit('volumeChange', percent)
    }
  }
}
</script>

<style lang="less" scoped>
.volume {
  display: flex;
  align-items: center;
  width: 150px;
  &-icon {
    margin-right: 5px;
    color: #fff;
  }
  &-progress-wrapper {
    flex: 1;
  }
  @media (max-width: 768px) {
    top: 2px;
    width: 36px;
  }
}
</style>
