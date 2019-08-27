import TempToast from './mm-toast.vue'

let instance
let showToast = false
let time // 存储toast显示状态
const mmToast = {
  install(Vue, options = {}) {
    let opt = TempToast.data() // 获取组件中的默认配置
    Object.assign(opt, options) // 合并配置
    Vue.prototype.$mmToast = (message, position) => {
      if (showToast) {
        clearTimeout(time)
        instance.vm.visible = showToast = false
        document.body.removeChild(instance.vm.$el)
        // return;// 如果toast还在，则不再执行
      }
      if (message) {
        opt.message = message // 如果有传message，则使用所传的message
      }
      if (position) {
        opt.position = position // 如果有传type，则使用所传的type
      }
      let TempToastConstructor = Vue.extend(TempToast)
      instance = new TempToastConstructor({
        data: opt
      })
      instance.vm = instance.$mount()
      document.body.appendChild(instance.vm.$el)
      instance.vm.visible = showToast = true

      time = setTimeout(function() {
        instance.vm.visible = showToast = false
        document.body.removeChild(instance.vm.$el)
      }, opt.duration)
    }
  }
}

export default mmToast
