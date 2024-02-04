<!-- icon 组件 -->
<script>
export default {
  name: 'MmIcon',
  props: {
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 16,
    },
  },
  methods: {
    getIconCls() {
      return `icon-${this.type}`
    },
    getIconStyle() {
      return { fontSize: this.size + 'px' }
    },
    onClick(e) {
      this.$emit('click', e)
    },
  },
  //render()替代了<template>, 具体见https://v2.cn.vuejs.org/v2/guide/render-function.html#JSX
  //通过生命周期图,可以看出render()是在created后面执行,所以methods中的函数已经可以准备好了
  render() {
    const Icon = (
      <i
        onClick={this.onClick}
        class={`iconfont ${this.getIconCls()}`}
        style={this.getIconStyle()}
      />
    )
    return Icon
  },
}
</script>

<style lang="less">
.iconfont {
  display: inline-block;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  line-height: 1;
  vertical-align: baseline;
  text-transform: none;
  speak: none;
  /* Better Font Rendering =========== */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
