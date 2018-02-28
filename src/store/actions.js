import {clearPlayList, setPlayList, removePlayList} from "../assets/js/storage";
import * as types from "./mutation-types";

//选择播放（会更新整个播放列表）
export const selectPlay = function ({commit}, {list, index}) {
    commit(types.SET_PLAYLIST, list);
    commit(types.SET_CURRENTINDEX, index);
    commit(types.SET_PLAYING, true)
};
//选择播放（会插入一条到播放列表）
export const selectAddPlay = function ({commit, state}, {item}) {
    let list = state.playlist.slice();
    list.unshift(item);
    commit(types.SET_PLAYLIST, list);
    commit(types.SET_CURRENTINDEX, 0);
    commit(types.SET_PLAYING, true)
};
//设置播放历史
export const setHistory = function ({commit}, music) {
    commit(types.SET_HISTORYLIST, setPlayList(music));
};
//删除播放历史
export const removeHistory = function ({commit}, music) {
    commit(types.SET_HISTORYLIST, removePlayList(music));
};
//清空播放历史
export const clearHistory = function ({commit}) {
    commit(types.SET_HISTORYLIST, clearPlayList());
};
