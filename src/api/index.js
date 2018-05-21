import axios from 'axios'
import {URL, defaultLimit} from 'assets/js/config'

//排行榜榜单
export function getToplistDetail() {
    const url = `${URL}/toplist/detail`;
    return axios.get(url)
}

//排行榜详情
export function topList(idx) {
    const url = `${URL}/top/list`;
    return axios.get(url, {
        params: {
            idx
        }
    })
}

export function topListMm(id) {
    const url = `${URL}/toplist/detail/mm`;
    return axios.get(url, {
        params: {
            id
        }
    })
}

//搜索
export function search(keywords, page = 0, limit = defaultLimit) {
    const url = `${URL}/search`;
    return axios.get(url, {
        params: {
            offset: page * limit,
            limit: limit,
            keywords
        }
    })
}

//热搜
export function searchHot() {
    const url = `${URL}/search/hot`;
    return axios.get(url)
}

//热门歌手
export function getTopArtists(offset = 0, limit = defaultLimit) {
    const url = `${URL}/top/artists`;
    return axios.get(url, {
        params: {
            offset,
            limit
        }
    })
}

//获取用户歌单详情
export function getUserPlaylist(uid) {
    const url = `${URL}/user/playlist`;
    return axios.get(url, {
        params: {
            uid
        }
    })
}

//获取歌曲详情
export function getMusicDetail(ids) {
    const url = `${URL}/song/detail`;
    return axios.get(url, {
        params: {
            ids
        }
    })
}

//获取音乐地址
export function getMusicUrl(id) {
    const url = `${URL}/music/url`;
    return axios.get(url, {
        params: {
            id
        }
    })
}

//获取歌词
export function getLyric(id) {
    const url = `${URL}/lyric`;
    return axios.get(url, {
        params: {
            id
        }
    })
}

//获取音乐评论
export function getComment(id, page, limit = defaultLimit) {
    const url = `${URL}/comment/music`;
    return axios.get(url, {
        params: {
            offset: page * limit,
            limit: limit,
            id
        }
    })
}
