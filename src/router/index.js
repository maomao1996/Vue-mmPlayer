import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router);

/**
 * 音乐相关
 */
//const Music = (resolve) => {
//    import('pages/mmPlayer/music').then((module) => {
//        resolve(module)
//    })
//};

//import Music from 'pages/mmPlayer/music'

const Music = () => import('pages/mmPlayer/music');
const PlayList = () => import('pages/mmPlayer/playList/playList');//正在播放列表
const Toplist = () => import('pages/mmPlayer/toplist/toplist');//排行榜列表
const Details = () => import('pages/mmPlayer/details/details');//音乐详情列表
const Search = () => import('pages/mmPlayer/search/search');//搜索
const Sheetlist = () => import('pages/mmPlayer/sheetlist/sheetlist');//歌单列表
const HistoryList = () => import('pages/mmPlayer/historyList/historyList');//我听过的列表

const routes = [
    {
        path: '/',
        redirect: '/music'
    }, {
        path: '/music',
        component: Music,
        redirect: '/music/playlist',
        children: [
            {
                path: '/music/playlist',//正在播放列表
                component: PlayList,
                meta: {
                    keepAlive: true
                }
            }, {
                path: '/music/sheetlist',//歌单列表
                component: Sheetlist
            }, {
                path: '/music/toplist',//排行榜列表
                component: Toplist,
                meta: {
                    keepAlive: true
                }
            }, {
                path: '/music/details',//音乐详情列表
                component: Details
            }, {
                path: '/music/historyList',//我听过的列表
                component: HistoryList
            }, {
                path: '/music/search',//搜索
                component: Search
            }
        ]
    }
];

export default new Router({
    linkActiveClass: 'active',
    linkExactActiveClass: 'active',
    routes,
})
