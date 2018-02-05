import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router);

import Music from 'pages/mmPlayer/music'
import PlayList from 'pages/mmPlayer/playList/playList'
import Sheetlist from 'pages/mmPlayer/sheetlist/sheetlist'
import Toplist from 'pages/mmPlayer/toplist/toplist'

import Details from 'pages/mmPlayer/details/details'

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
                path: '/music/playlist',
                component: PlayList,
                meta: {
                    keepAlive: true
                }
            }, {
                path: '/music/sheetlist',
                component: Sheetlist
            }, {
                path: '/music/toplist',
                component: Toplist,
                meta: {
                    keepAlive: true
                }
            }, {
                path: '/music/details',
                component: Details
            }
        ]
    }
];

export default new Router({
    linkActiveClass: 'active',
    linkExactActiveClass: 'active',
    routes,
})
