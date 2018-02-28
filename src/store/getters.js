//加载状态
export const isShow = state => state.isShow;
//audio元素
export const audioEle = state => state.audioEle;
//播放状态
export const playing = state => state.playing;
//播放列表
export const playlist = state => state.playlist;
//当前音乐索引
export const currentIndex = state => state.currentIndex;
//当前音乐
export const currentMusic = (state) => {
    return state.playlist[state.currentIndex] || {}
};
//播放历史列表
export const historyList = state => state.historyList;
//我喜欢的列表
export const likeList = state => state.likeList;
