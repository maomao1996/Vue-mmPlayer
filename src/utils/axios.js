import axios from 'axios'
import Vue from 'vue'
import { getSid } from '@/utils/storage'
import { http } from '@tauri-apps/api'
const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API_URL,
  withCredentials: true, // 跨域请求时发送Cookie
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  }
})

request.interceptors.request.use((config) => {
  config.params = {
    _sid: getSid(),
    ...config.params
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    if (response.status === 200 && response.data.success) {
      return Promise.resolve(response.data)
    }
    console.log(response)
    return Promise.reject(response)
  },
  (error) => {
    Vue.prototype.$mmToast(
      error.response ? error.response.data.message : error.message
    )
    return error
  }
)
// export default request

class TauriHttp {
  interceptors = {
    baseURL: process.env.VUE_APP_BASE_API_URL,
    requert: {
      headers: {},
      body: {},
      use: () => {}
    },
    response: (response) => {
      return new Promise((rec, rej) => {
        console.log(response)
        if (response.status === 200 && response.data.success) {
          return rec(response.data)
        }
        return Promise.reject(response)
      })
    }
  }
  post = (url, data) => {
    return new Promise((resolve) => {
      const requestBody = { ...data, ...this.interceptors.requert.body }
      const requestHeaders = { ...this.interceptors.requert.headers }
      http
        .fetch(this.interceptors.baseURL + url, {
          headers: requestHeaders,
          method: 'POST',
          // 常规的json格式请求体发送
          body: http.Body.json(requestBody)
        })
        .then((res) => {
          // res为请求成功的回调数据
          resolve(this.interceptors.response(res))
        })
    })
  }
  get = (url, data) => {
    console.log(url)
    return new Promise((resolve) => {
      const requestQuery = { ...data, ...this.interceptors.requert.body }
      const sid = getSid()
      if (sid) {
        requestQuery['_sid'] = getSid()
        console.log(requestQuery)
      }
      const requestHeaders = { ...this.interceptors.requert.headers }
      http
        .fetch(this.interceptors.baseURL + url, {
          headers: requestHeaders,
          method: 'GET',
          // 常规的json格式请求体发送
          query: requestQuery
        })
        .then((res) => {
          console.log(res)
          // res为请求成功的回调数据
          resolve(res)
        })
    })
  }
}
const taurihttp = new TauriHttp()
export default taurihttp
