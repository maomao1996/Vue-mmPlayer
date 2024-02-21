import axios from 'axios'
import Vue from 'vue'

// region Netease official
const axiosNetease = axios.create({
  baseURL: process.env.VUE_APP_NETEASE_API_1,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})
axiosNetease.interceptors.response.use(
  (response) => {
    //window.response = response

    if (response.status === 200 && response.data.code === 200) {
      return response.data
    }
    return Promise.reject(response)
  },
  (error) => {
    Vue.prototype.$mmToast(error.response ? error.response.data.message : error.message)
    return error
  },
)
//endregion

// region NeteaseCloudSpider
const axiosNeteaseSpider = axios.create({
  baseURL: process.env.VUE_APP_NETEASE_SPIDER_API,
})

axiosNeteaseSpider.interceptors.response.use(
  (response) => {
    //window.response = response

    if (response.status === 200 && response.data.code === 200) {
      return response.data
    }
    return Promise.reject(response)
  },
  (error) => {
    Vue.prototype.$mmToast(error.response ? error.response.data.message : error.message)
    return error
  },
)
// endregion

// region BiliAPIBackend
const axiosBiliSpider = axios.create({
  baseURL: process.env.VUE_APP_BILI_SPIDER_API,
})

axiosBiliSpider.interceptors.response.use(
  (response) => {
    //window.response = response

    if (response.status === 200) {
      return response
    }
    return Promise.reject(response)
  },
  (error) => {
    Vue.prototype.$mmToast(error.response ? error.response.data.message : error.message)
    return error
  },
)
// endregion

// region BiliInfoApi
const axiosBiliInfo = axios.create({
  baseURL: process.env.VUE_APP_BILI_INFO_API,
})
axiosBiliInfo.interceptors.response.use(
  (response) => {

    if (response.status === 200 && response.data.code === 0) {
      return response.data
    }
    return Promise.reject(response)
  },
  (error) => {
    Vue.prototype.$mmToast(error.response ? error.response.data.message : error.message)
    return error
  },
)
// endregion

// region QQ-common API
const axiosCommonQQ = axios.create({
  baseURL: process.env.VUE_APP_QQ_COMMON_API,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

axiosCommonQQ.interceptors.response.use(
  (response) => {
    if (response.status === 200 && response.data.code === 0) {
      ////console.log('axiosCommonQQ.interceptors')
      ////console.log(response)
      return response.data
    }
    return Promise.reject(response)
  },
  (error) => {
    Vue.prototype.$mmToast(error.response ? error.response.data.message : error.message)
    return error
  },
)
// endregion

// region QQ-listDetail API
const axiosQQlistDetail = axios.create({
  baseURL: process.env.VUE_APP_QQ_LIST_DETAIL_API,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

axiosQQlistDetail.interceptors.response.use(
  (response) => {
    if (response.status === 200 && response.data.code === 0) {
      return response.data
    }
    return Promise.reject(response)
  },
  (error) => {
    Vue.prototype.$mmToast(error.response ? error.response.data.message : error.message)
    return error
  },
)
// endregion

// export
export {axiosQQlistDetail , axiosBiliInfo, axiosNetease, axiosNeteaseSpider, axiosBiliSpider, axiosCommonQQ}

