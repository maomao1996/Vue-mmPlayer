import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getters'
import * as actions from './actions'
import mutations from './mutations'
//vuex调试
import createLogger from 'vuex/dist/logger'
import {getPlayList} from "../assets/js/storage";
const debug = process.env.NODE_ENV !== 'production';

Vue.use(Vuex);

const state = {
    isShow: false,//加载状态
    
    audioEle: null,//audio元素
    playing: false,//播放状态
    playlist: [],//播放列表
    currentIndex: -1,//当前音乐索引
    likeList: [],//我喜欢的列表
    historyList: getPlayList() || [],//播放历史列表
};

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    //vuex调试
    strict: debug,
    plugins: debug ? [createLogger()] : []
})
