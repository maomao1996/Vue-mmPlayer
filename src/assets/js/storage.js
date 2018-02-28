const PLAYLIST_KEY = '__mmPlayer_historyList__';
const PlayListMAX = 200;
const storage = {
    get(key) {
        if (window.localStorage) {
            return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : []
        }
    },
    set(key, val) {
        if (window.localStorage) {
            localStorage.setItem(key, val)
        }
    },
    clear(key){
        if (window.localStorage) {
            localStorage.removeItem(key);
        }
    }
};

//获取播放历史
export function getPlayList() {
    return storage.get(PLAYLIST_KEY)
}

//更新播放历史
export function setPlayList(music) {
    let list = storage.get(PLAYLIST_KEY);
    const index = list.findIndex(item => {
        return item.id === music.id
    });
    if (index === 0) {
        return list
    }
    if (index > 0) {
        list.splice(index, 1)
    }
    list.unshift(music);
    if (PlayListMAX && list.length > PlayListMAX) {
        list.pop()
    }
    storage.set(PLAYLIST_KEY, JSON.stringify(list));
    return list;
}

//删除一条播放历史
export function removePlayList(music) {
    storage.set(PLAYLIST_KEY, JSON.stringify(music));
    return music
}

//清空播放历史
export function clearPlayList() {
    storage.clear(PLAYLIST_KEY);
    return []
}
