//music相关
import Vue from 'vue'
import Vuex from 'vuex'
import * as types from '../mutation-types'
import {getPlayList, setPlayList, clearPlayList} from '../../assets/js/storage'

Vue.use(Vuex);

const mmPlayer = {
    state: {
        audioEle: null,//audio元素
        playing: false,//播放状态
        playlist: [],//播放列表
        currentIndex: -1,//当前音乐索引
        likeList: [],//我喜欢的列表
    
        historyList: getPlayList() || [],//播放历史列表
    },
    getters: {
        audioEle: state => state.audioEle,//audio元素
        playing: state => state.playing,//播放状态
        playlist: state => state.playlist,//播放列表
        currentIndex: state => state.currentIndex,//当前音乐索引
        currentMusic: (state) => {
            return state.playlist[state.currentIndex] || {}
        },//当前音乐
        likeList: state => state.likeList,//我喜欢的列表
        historyList: state => state.historyList,//播放历史列表
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
        //清空播放列表
        [types.CLEAR_PLAYLIST](state) {
            state.playlist = []
        },
        //修改当前音乐索引
        [types.SET_CURRENTINDEX](state, currentIndex) {
            state.currentIndex = currentIndex
        },
        //修改我喜欢的列表
        [types.SET_LIKELIST](state, likeList) {
            state.likeList = likeList
        },
        //修改播放历史列表
        [types.SET_HISTORYLIST](state, historyList) {
            state.historyList = historyList
        },
    },
    actions: {
        //选择播放
        selectPlay({commit}, {list, index}) {
            commit(types.SET_PLAYLIST, list);
            commit(types.SET_CURRENTINDEX, index);
            commit(types.SET_PLAYING, true)
        },
        setHistoryList({commit}, music) {
            commit(types.SET_HISTORYLIST, setPlayList(music));
        },
        clearHistory({commit}){
            commit(types.SET_HISTORYLIST, clearPlayList());
        }
    }
};

export default mmPlayer
