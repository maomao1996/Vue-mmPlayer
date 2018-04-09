import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router);

const routes = [
    {
        path: '/',
        redirect: '/music'
    }, {
        path: '/music',
        component: () => import('pages/music'),
        redirect: '/music/playlist',
        children: [
            {
                path: '/music/playlist',//正在播放列表
                component: () => import('pages/playList/playList'),
                meta: {
                    keepAlive: true
                }
            }, {
                path: '/music/userlist',//我的歌单
                component: () => import('pages/userList/userList'),
                meta: {
                    keepAlive: true
                }
            }, {
                path: '/music/toplist',//排行榜列表
                component: () => import('pages/topList/topList'),
                meta: {
                    keepAlive: true
                }
            }, {
                path: '/music/details',//音乐详情列表
                component: () => import('pages/details/details')
            }, {
                path: '/music/historylist',//我听过的列表
                component: () => import('pages/historyList/historyList')
            }, {
                path: '/music/search',//搜索
                component: () => import('pages/search/search'),
                meta: {
                    keepAlive: true
                }
            }
        ]
    }
];

export default new Router({
    linkActiveClass: 'active',
    linkExactActiveClass: 'active',
    routes,
})
