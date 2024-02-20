import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

const routes = [
  {
    path: '/',
    redirect: '/music',
  },
  {
    path: '/music',
    component: () => import('pages/music'),
    redirect: '/music/playlist',
    children: [
      {
        path: '/music/about', // 教程
        component: () => import('pages/about/about'),
      },
      {
        name: 'BindSongsAudio',
        path: '/music/bindSongsAudio', // bindAudio
        component: () => import('pages/bindSongsAudio/bindSongsAudio'),
      },
      {
        path: '/music/playlist', // 正在播放列表
        component: () => import('pages/playList/playList'),
      },
      {
        name: 'bili-search',
        path: '/music/bilisearch', // 正在播放列表
        component: () => import('pages/bili/bilisearch'),
      },
      {
        path: '/music/userlist', // 我的歌单
        component: () => import('pages/userList/userList.vue'),
        meta: {
          title: '我的歌单',
        },
      },
      {
        path: '/music/toplist', // 排行榜列表
        component: () => import('pages/topList/topList'),
        meta: {
          title: '排行榜',
        },
      },
      {
        path: '/music/details/:platform/:id', // 音乐详情列表
        component: () => import('pages/details/details'),
      },
      {
        path: '/music/historylist', // 我听过的列表
        component: () => import('pages/historyList/historyList'),
        meta: {
          title: '我听过的',
        },
      },
      {
        path: '/music/search', // 搜索
        component: () => import('pages/search/search'),
        meta: {
          title: '搜索',
        },
      },
      {
        path: '/music/comment/:id', // 音乐评论
        component: () => import('pages/comment/comment'),
        meta: {
          title: '评论详情',
        },
      },
    ],
  },
]

export default new Router({
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
  routes,
})
