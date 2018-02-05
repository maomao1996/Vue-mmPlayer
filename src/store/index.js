import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getters'
import mutations from './mutations'
//mmPlayer相关
import MmPlayer from './modules/mmPlayer.js'

//vuex调试
import createLogger from 'vuex/dist/logger'
const debug = process.env.NODE_ENV !== 'production';

Vue.use(Vuex);

const state = {
    isShow: false,//加载状态
};

export default new Vuex.Store({
    state,
    getters,
    mutations,
    modules: {
        mmPlayer: MmPlayer
    },
    //vuex调试
    strict: debug,
    plugins: debug ? [createLogger()] : []
})
