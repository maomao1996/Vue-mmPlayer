<template>
  <!--弹出层提示-->
  <transition name="toast-fade">
    <div v-show="visible" class="mm-toast" :class="positionClasss">
      {{ message }}
    </div>
  </transition>
</template>

<script>
export default {
  name: 'MmToast',
  data() {
    return {
      position: 'center', // 默认显示位置
      message: '', // 默认显示文本
      duration: 1500, // 显示时间, 毫秒
      visible: false // 是否显示
    }
  },
  computed: {
    positionClasss() {
      return 'mm-toast-' + this.position
    }
  }
}
</script>

<style lang="less">
@prefix-cls: mm-toast;

.@{prefix-cls} {
  position: fixed;
  left: 50%;
  z-index: 1996;
  max-width: 80%;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 10px 20px;
  overflow: hidden;
  text-align: center;
  min-height: 40px;
  line-height: 20px;
  font-size: 14px;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  user-select: none;
  transform: translateX(-50%);
  &&-top {
    top: 10%;
  }
  &&-center {
    top: 50%;
    margin-top: -20px;
  }
  &&-bottom {
    bottom: 10%;
  }
}

.toast-fade-enter {
  opacity: 0;
  transform: translate3d(-50%, -10px, 0);
}

.toast-fade-enter-active {
  will-change: transform;
  transition: all 0.2s;
}

.toast-fade-enter-to {
  opacity: 1;
  transform: translate3d(-50%, 0, 0);
}
</style>
