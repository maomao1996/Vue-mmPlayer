import axios from 'axios'
import Vue from 'vue'

const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API_URL
})

request.interceptors.response.use(
  response => {
    window.response = response

    if (response.status === 200 && (response.data.code === 200 || response.data.data?.code === 200)) {
      return response.data
    }

    if ((response.data.code === 302 || response.data.data?.code === 302)) {
      Vue.prototype.$mmToast('请使用账号密码登录')
      return Promise.reject(response)
    }

    Vue.prototype.$mmToast(
      response.data?.message || response.data?.msg
    )
    return Promise.reject(response)
  },
  error => {
    Vue.prototype.$mmToast(
      error.response ? error.response.data.message : error.message
    )
    return error
  }
)

export default request
