import axios from 'axios'
const URL = 'http://localhost:3000';

//搜索
export function search(keywords){
    const url = URL+'/search';
    return axios.get(url, {
        params: {
            keywords: keywords
        }
    })
}

//获取歌单详情
export function getPlaylistDetail(id) {
    const url = URL+'/playlist/detail';
    return axios.get(url, {
        params: {
            id: id
        }
    })
}

//获取歌曲详情
export function getMusicDetail(id) {
    const url = URL+'/song/detail';
    return axios.get(url, {
        params: {
            ids: id
        }
    })
}

//获取音乐地址
export function getMusicUrl(id) {
    const url = URL+'/music/url';
    return axios.get(url, {
        params: {
            id: id
        }
    })
}

//获取歌词
export function getLyric(id) {
    const url = URL+'/lyric';
    return axios.get(url, {
        params: {
            id: id
        }
    })
}

//排行榜
export function topList(idx) {
    const url = URL+'/top/list';
    return axios.get(url, {
        params: {
            idx: idx
        }
    })
}

//下载
export function download(id,name) {
    const url = URL+'/download';
    return axios.get(url, {
        params: {
            id: id,
            name: name
        }
    })
}
