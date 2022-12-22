import axios from 'axios'
import Vue from 'vue'

const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  }
})

request.interceptors.response.use(
  (response) => {
    window.response = response

    if (response.status === 200 && response.data.success) {
      return response.data
    }
    return Promise.reject(response)
  },
  (error) => {
    Vue.prototype.$mmToast(
      error.response ? error.response.data.message : error.message
    )
    return error
  }
)

export default request
