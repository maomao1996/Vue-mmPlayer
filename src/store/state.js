import {playMode} from "assets/js/config";
import {getHistoryList, getMode} from "assets/js/storage";

const state = {
    audioEle: null,//audio元素
    mode: Number(getMode()) || playMode.listLoop,//播放模式，默认列表循环
    playing: false,//播放状态
    playlist: [],//播放列表
    orderList: [],//顺序列表
    currentIndex: -1,//当前音乐索引
    likeList: [],//我喜欢的列表
    historyList: getHistoryList() || [],//播放历史列表
};

export default state
