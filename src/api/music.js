import axios from 'axios'
//// 添加请求拦截器
//axios.interceptors.request.use(function (config) {
//    // 在发送请求之前做些什么
//    console.log('请求拦截器API')
//    console.log(config)
//    return config;
//}, function (error) {
//    // 对请求错误做些什么
//    return Promise.reject(error);
//});
//
//// 添加响应拦截器
//axios.interceptors.response.use(function (response) {
//    // 对响应数据做点什么
//    console.log('响应拦截器API')
//    console.log(response)
//    return response;
//}, function (error) {
//    // 对响应错误做点什么
//    return Promise.reject(error);
//});
const URL = 'http://localhost:3000';


//排行榜榜单
export function getToplistDetail(){
    const url = URL + '/toplist/detail';
    return axios.get(url)
}

//排行榜详情
export function topList(idx) {
    const url = URL+'/top/list';
    return axios.get(url, {
        params: {
            idx: idx
        }
    })
}
export function topListMm(id) {
    const url = URL+'/toplist/detail/mm';
    return axios.get(url, {
        params: {
            id: id
        }
    })
}

//搜索
export function search(keywords,page=0){
    const url = URL+'/search';
    return axios.get(url, {
        params: {
            keywords: keywords,
            offset: page*50,
            limit: 50
        }
    })
}

//热门歌手
export function getTopArtists(offset = 0,limit = 50) {
    const url = URL + '/top/artists';
    return axios.get(url, {
        params: {
            offset: offset,
            limit: limit
        }
    })
}

//获取用户歌单详情
export function getUserPlaylist(id) {
    const url = URL+'/user/playlist';
    return axios.get(url, {
        params: {
            uid: id
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
//export function getMusicUrl(id) {
//    const url = URL+'/music/url';
//    return axios.get(url, {
//        params: {
//            id: id
//        }
//    })
//}

//获取歌词
export function getLyric(id) {
    const url = URL+'/lyric';
    return axios.get(url, {
        params: {
            id: id
        }
    })
}

//下载
//export function download(id,name) {
//    const url = URL+'/download';
//    return axios.get(url, {
//        params: {
//            id: id,
//            name: name
//        }
//    })
//}
