//music相关
import Vue from 'vue'
import Vuex from 'vuex'
import * as types from '../mutation-types'

Vue.use(Vuex);

const mmPlayer = {
    state: {
        audioEle: null,//audio元素
        playing: false,//播放状态
        playlist: [],//播放列表
        currentIndex: -1,//当前音乐索引
        currentTime: 0,//当前播放时间
        duration: 0,//当前音乐的总时间
    },
    getters: {
        audioEle: state => state.audioEle,//audio元素
        playing: state => state.playing,//播放状态
        playlist: state => state.playlist,//播放列表
        currentIndex: state => state.currentIndex,//当前音乐索引
        //当前音乐
        currentMusic: (state) => {
            return state.playlist[state.currentIndex] || {}
        },
        currentTime: state => state.currentTime,//当前播放时间
        duration: state => state.duration,//当前音乐的总时间
    },
    mutations: {
        //修改audio元素
        [types.SET_AUDIOELE](state, audioEle) {
            state.audioEle = audioEle
        },
        //修改播放状态
        [types.SET_PLAYING](state, playing) {
            state.playing = playing
        },
        //修改播放列表
        [types.SET_PLAYLIST](state, playlist) {
            state.playlist = playlist
        },
        //修改当前音乐索引
        [types.SET_CURRENTINDEX](state, currentIndex) {
            state.currentIndex = currentIndex
        },
        //修改当前播放时间
        [types.SET_CURRENTTIME](state, currentTime) {
            state.currentTime = currentTime
        },
        //修改当前播放时间
        [types.SET_DURATION](state, duration) {
            state.duration = duration
        },
    },
    actions: {
        selectPlay({commit}, {list, index}) {
            commit(types.SET_PLAYLIST, list);
            commit(types.SET_CURRENTINDEX, index);
            commit(types.SET_PLAYING, true)
        }
    }
};

export default mmPlayer
