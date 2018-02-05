<template>
    <div id="app" class="mmPlayer">
        <div class="mmPlayer-box" :class="{mobile:isMobile}">
            <!--头部-->
            <div class="mmPlayer-header">
                mmPlayer试用版（功能优化中）
            </div>
            <!--主体-->
            <div class="mmPlayer-container" style="min-width: 0;min-height: 0">
                <!--按钮部分-->
                <div class="mmPlayer-btn">
                    <span :class="{on:isMobile&&listIndex===0}" v-show="isMobile" class="btn-player"
                          @click="listIndex=0">播放器</span>
                    <span :class="{on:isMobile&&listIndex===1}" @click="listIndex=1">正在播放</span>
                    <!--<div class="mmPlayer-search" :class="{'input-focus':isSearch}">-->
                    <!--<span v-show="!isSearch" @click="isSearch=true;listIndex=2">音乐搜索</span>-->
                    <!--<input placeholder="请输入歌曲名" type="text" @blur="isSearch=false" v-model.trim="keywords" @keyup.enter="onSearch">-->
                    <!--</div>-->
                </div>
                <!--列表部分-->
                <div class="mmPlayer-list-box" style="min-width: 0;min-height: 0" v-show="listIndex!==0">
                    <div v-show="listIndex===1" class="mmPlayer-list">
                        <div class="list-item mmPlayer-list-header">
                            <span class="list-name">歌曲</span>
                            <span class="list-artist">歌手</span>
                            <span class="list-time">专辑</span>
                        </div>
                        <div class="list-item" v-for="(item,index) in currentList" :key="index"
                             :class="{on:currentMusic.id===item.id&&isPlay}">
                            <span class="list-num" v-text="index+1"></span>
                            <div class="list-name">
                                <span>{{item.name}}</span>
                                <div class="list-menu">
                                    <span class="list-menu-icon-play" :class="{on:currentIndex===index&&isPlay}"
                                          @click="clickList(index)"></span>
                                    <a :href="'https://music.163.com/song/media/outer/url?id='+item.id+'.mp3'"
                                       class="list-menu-icon-down" :download="item.name"
                                       @click="downloadMusic(item.name,item.artist)"></a>
                                </div>
                            </div>
                            <span class="list-artist">{{item.artist}}</span>
                            <span class="list-time">{{item.album}}</span>
                        </div>
                    </div>
                    <!--搜索列表-->
                    <div v-show="listIndex===2" class="mmPlayer-list">
                        <div class="list-item mmPlayer-list-header">
                            <span class="list-name">歌曲</span>
                            <span class="list-artist">歌手</span>
                            <span class="list-time">专辑</span>
                        </div>
                        <div class="list-item" v-for="(item,index) in searchList" :key="index">
                            <span class="list-num" v-text="index+1"></span>
                            <div class="list-name">
                                <span>{{item.name}}</span>
                                <div class="list-menu">
                                    <span class="list-menu-icon-play" @click="clickSearchList(index)"></span>
                                    <span class="list-menu-icon-down"></span>
                                </div>
                            </div>
                            <span class="list-artist">{{item.artists}}</span>
                            <span class="list-time">{{item.album}}</span>
                        </div>
                    </div>
                </div>
                <!--音乐信息-->
                <div class="mmPlayer-info-box" :class="{on:isMobile&&listIndex===0}">
                    <div class="mmPlayer-info">
                        <!--封面-->
                        <dl class="mmPlayer-info-cover">
                            <dt>
                                <img
                                    :src="currentMusic.picUrl?currentMusic.picUrl:require('./assets/img/player_cover.png')">
                            </dt>
                            <dd>歌曲名：{{currentMusic.name}}</dd>
                            <dd>歌手名：{{currentMusic.artist}}</dd>
                            <dd>专辑名：{{currentMusic.album}}</dd>
                        </dl>
                        <!--歌词-->
                        <div class="mmPlayer-lyric" ref="mmPlayerLyric">
                            <div class="mmPlayer-lyric-items"
                                 :style="{transform :'translate3d(0px, '+(-34*lyricIndex)+'px, 0px)'}">
                                <p v-for="(item,index) in lyric" :key="index" :class="{on:index===lyricIndex}">
                                    {{item.text}}</p>
                                <p v-if="!lyric">歌词加载失败</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!--底部-->
            <div class="mmPlayer-bar">
                <a class="mmPlayer-bar-btn btn-prev" @click="prev"></a>
                <a class="mmPlayer-bar-btn btn-play" :class="{'btn-play-pause':isPlay}" @click="play"></a>
                <a class="mmPlayer-bar-btn btn-next" @click="next"></a>
                <div class="mmPlayer-music">
                    <div class="mmPlayer-bar-info">{{currentMusic.name}}&nbsp;-&nbsp;{{currentMusic.artist}}</div>
                    <div class="mmPlayer-bar-time">{{currentTime | format}}/{{currentDuration | format}}</div>
                    <mm-progress class="mmPlayer-progress" @percentChange="progressMusic"
                                 :percent="progressVal"></mm-progress>
                </div>
                <div class="mmPlayer-bar-volume">
                    <a class="mmPlayer-bar-btn btn-volume" :class="{'btn-volume-no':isMute}" @click="switchMute"></a>
                    <mm-progress @percentChange="volumeChange"
                                 :percent="volume"></mm-progress>
                </div>
            </div>
        </div>
        
        <!--遮罩-->
        <div class="mmPlayer-bg-mask"></div>
        <div class="mmPlayer-bg" :style="{backgroundImage: 'url('+currentMusic.picUrl+')'}"></div>
        
        <!--播放器-->
        <audio ref="audio" :src="'https://music.163.com/song/media/outer/url?id='+currentMusic.id+'.mp3'" @canplay="canplay"
               @ended="ended" @error="error"
               @timeupdate="timeupdate"></audio>
    </div>
</template>

<script>
    import MmProgress from 'base/mm-progress/mm-progress'
    import {topList, search, getMusicUrl, getMusicDetail, getLyric, download} from 'api/music'
    
    export default {
        name: "mmPlayer",
        components: {
            MmProgress
        },
        data() {
            return {
                //currentList: [
                //    {
                //        id: 432506345,
                //        name: "童话镇",
                //        artists: [
                //            {
                //                id: 1137098,
                //                name: "陈一发儿",
                //                picUrl: null,
                //                alias: [ ],
                //                albumSize: 0,
                //                picId: 0,
                //                img1v1Url: "http://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
                //                img1v1: 0,
                //                trans: null
                //            }
                //        ],
                //        album: {
                //            id: 34898300,
                //            name: "童话镇",
                //            artist: {
                //                id: 0,
                //                name: "",
                //                picUrl: null,
                //                alias: [ ],
                //                albumSize: 0,
                //                picId: 0,
                //                img1v1Url: "http://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
                //                img1v1: 0,
                //                trans: null
                //            },
                //            publishTime: 1474992000007,
                //            size: 1,
                //            copyrightId: 0,
                //            status: 0,
                //            picId: 3394192426154346
                //        },
                //        duration: 257914,
                //        copyrightId: 0,
                //        status: 0,
                //        alias: [ ],
                //        rtype: 0,
                //        ftype: 0,
                //        mvid: 0,
                //        fee: 0,
                //        rUrl: null
                //    },{
                //        id: 452986458,
                //        name: "红昭愿",
                //        artists: [
                //            {
                //                id: 12174521,
                //                name: "音阙诗听",
                //                picUrl: null,
                //                alias: [ ],
                //                albumSize: 0,
                //                picId: 0,
                //                img1v1Url: "http://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
                //                img1v1: 0,
                //                trans: null
                //            }
                //        ],
                //        album: {
                //            id: 35114938,
                //            name: "红昭愿",
                //            artist: {
                //                id: 0,
                //                name: "",
                //                picUrl: null,
                //                alias: [ ],
                //                albumSize: 0,
                //                picId: 0,
                //                img1v1Url: "http://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
                //                img1v1: 0,
                //                trans: null
                //            },
                //            publishTime: 1484064000007,
                //            size: 2,
                //            copyrightId: 30002,
                //            status: 0,
                //            picId: 109951162951242160
                //        },
                //        duration: 173217,
                //        copyrightId: 30002,
                //        status: 0,
                //        alias: [ ],
                //        rtype: 0,
                //        ftype: 0,
                //        mvid: 0,
                //        fee: 8,
                //        rUrl: null
                //    }
                //],//音乐列表
                //historyList: [],//播放历史
                listIndex: 1,
                isMobile: false,//是否小屏幕
                isPlay: false, //是否播放
                bgUrl: '',//全屏背景url
                currentList: [], //音乐列表
                currentIndex: 0,//当前音乐下标
                currentTime: 0,//当前播放时间
                currentDuration: '00：00',
                progressVal: 0,//音乐进度
                volume: .5,//音量大小
                isMute: false,//是否静音
                lyric: [],//音乐歌词
                lyricIndex: -1,//当前音乐歌词下标
                isSearch: false,//搜索按钮
                keywords: '',//搜索内容
                searchList: [],//搜索列表
            }
        },
        created() {
            document.querySelector('#appLoading').classList.add("removeAnimate")
            setTimeout(function () {
                document.body.removeChild(document.getElementById('appLoading'))
            }, 500);
        },
        mounted() {
            window.addEventListener("resize", () => {
                this.adjustResize()
            });
            console.info('欢迎使用 MmPlayer!\n作者：maomao(http://www.mtnhao.com)\n歌曲来源于网易云音乐(http://music.163.com)');
            topList(1)
                .then((res) => {
                    //console.log(res);
                    if (res.data.code === 200) {
                        //console.log(res.data.playlist.tracks);
                        let list = res.data.playlist.tracks.map((item) => {
                            return {
                                id: item.id,
                                name: item.name,
                                artist: item.ar[0].name,
                                album: item.al.name,
                                picUrl: item.al.picUrl
                            }
                        });
                        //console.log(list);
                        this.currentList = list;
                        this.$nextTick(() => {
                            this.adjustResize()
                            //this.$refs.audio.defaultPlaybackRate = 4
                        })
                    }
                });
        },
        computed: {
            currentMusic() {
                if (this.currentList.length === 0) {
                    return {}
                } else {
                    return this.currentList[this.currentIndex]
                }
            }
        },
        watch: {
            currentTime(newTime) {
                this.progressVal = newTime / this.currentDuration;
                let lyricIndex = 0;
                for (let i = 0; i < this.lyric.length; i++) {
                    if (newTime > this.lyric[i].time) {
                        lyricIndex = i;
                    }
                }
                this.lyricIndex = lyricIndex;
            },
            currentMusic(newMusic, oldMusic) {
                //console.log("newMusic", newMusic)
                //console.log("oldMusic", oldMusic)
                if (!newMusic.id) {
                    return false
                }
                if (newMusic.id === oldMusic.id) {
                    return false
                }
                this.getMusic(newMusic);
            },
            isPlay(newPlay) {
                const audio = this.$refs.audio;
                this.$nextTick(() => {
                    newPlay ? audio.play() : audio.pause();
                })
            }
        },
        methods: {
            //根据歌曲ID获取详情和歌词
            getMusic(data) {
                const Detail = getMusicDetail(data.id)
                    .then((res) => {
                        //console.log("歌曲信息", res);
                        if (res.data.code === 200) {
                            this.bgUrl = res.data.songs[0].al.picUrl
                        }
                    });
                const Lyric = getLyric(data.id)
                    .then((res) => {
                        if (res.data.code === 200) {
                            //console.log("歌词", res.data.lrc.lyric)
                            this.lyric = parseLyric(res.data.lrc.lyric);
                            //console.log(typeof this.lyric)
                        }
                    })
                Promise.all([Detail, Lyric])
                    .then(result => {
                        this.currentUrl = data.id;
                        this.isPlay = true;
                    })
            },
            adjustResize() {
                if (document.body.clientWidth > 900) {
                    this.isMobile = false;
                    this.listIndex = 1
                } else {
                    this.isMobile = true
                }
            },
            //搜索
            onSearch() {
                if (this.keywords !== '') {
                    search(this.keywords)
                        .then((res) => {
                            if (res.data.code === 200) {
                                this.isSearch = false;
                                this.keywords = '';
                                let list = res.data.result.songs.map((item) => {
                                    return {
                                        name: item.name,
                                        id: item.id,
                                        artists: item.artists[0],
                                        album: {id: item.album.id, name: item.album.name}
                                    }
                                });
                                this.searchList = list;
                                console.log("搜索", res.data.result.songs)
                                //console.log("filter", list)
                            }
                        })
                }
            },
            clickSearchList(index) {
                this.currentList = [];
                this.currentIndex = index;
            },
            clickList(index) {
                this.isPlay = !this.isPlay;
                this.currentIndex = index;
            },
            //获取音乐时长
            canplay() {
                this.currentDuration = this.$refs.audio.duration;
            },
            //当前音乐播放结束
            ended() {
                this.next();
                console.log("音乐播放结束啦！！！")
            },
            //当前音乐播放出错
            error() {
                //this.next();
                console.log("音乐播放出错啦！！！")
            },
            //当前播放时间
            timeupdate() {
                this.currentTime = this.$refs.audio.currentTime;
            },
            //上一曲
            prev() {
                this.isPlay = false;
                let i = this.currentIndex;
                if (i <= 0) {
                    this.currentIndex = this.currentList.length - 1
                } else {
                    i--;
                    this.currentIndex = i
                }
                //console.log(this.currentIndex)
            },
            //暂停播放
            play() {
                this.isPlay ? this.isPlay = false : this.isPlay = true
            },
            //下一曲
            next() {
                this.isPlay = false;
                let i = this.currentIndex;
                if (i === this.currentList.length - 1) {
                    this.currentIndex = 0
                } else {
                    i++;
                    this.currentIndex = i
                }
                //console.log(this.currentIndex)
            },
            //修改音乐进度
            progressMusic(percent) {
                this.$refs.audio.currentTime = Math.round(this.currentDuration * percent)
            },
            //修改音量大小
            volumeChange(percent){
                percent===0 ? this.isMute = true : this.isMute = false;
                this.volume = percent;
                this.$refs.audio.volume = percent;
            },
            //是否静音
            switchMute(){
                let audio = this.$refs.audio;
                this.isMute = !this.isMute;
                this.isMute ? audio.volume = 0 : audio.volume = this.volume
            },
            //下载音乐
            downloadMusic(name, artist) {
                if (this.isMobile) {
                    return false
                }
                let oInput = document.createElement('input');
                oInput.value = name + ' - ' + artist;
                document.body.appendChild(oInput);
                oInput.select();
                document.execCommand("Copy");
                oInput.style.display = 'none';
                setTimeout(() => {
                    document.body.removeChild(oInput)
                }, 200)
            }
        },
        filters: {
            //时间格式化
            format(value) {
                let minute = Math.floor(value / 60);
                let second = Math.floor(value % 60);
                return `${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
            },
        }
    }
    
    //歌词解析（来源：https://github.com/TivonJJ/html5-music-player）
    function parseLyric(lrc) {
        let lyrics = lrc.split("\n");
        let lrcObj = [];
        for (let i = 0; i < lyrics.length; i++) {
            let lyric = decodeURIComponent(lyrics[i]);
            let timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
            let timeRegExpArr = lyric.match(timeReg);
            if (!timeRegExpArr) continue;
            let clause = lyric.replace(timeReg, '');
            for (let k = 0, h = timeRegExpArr.length; k < h; k++) {
                let t = timeRegExpArr[k];
                let min = Number(String(t.match(/\[\d*/i)).slice(1)),
                    sec = Number(String(t.match(/\:\d*/i)).slice(1));
                let time = min * 60 + sec;
                //lrcObj[time] = clause;
                if (clause !== '') {
                    lrcObj.push({time: time, text: clause})
                }
            }
        }
        //console.log(lrcObj)
        return lrcObj;
    }
</script>

<style lang="less">
    @color: rgba(255, 255, 255, .8);
    
    .mmPlayer {
        position: relative;
        font-size: 14px;
        color: @color;
        .mmPlayer-box {
            position: relative;
            z-index: 3;
            display: flex;
            flex-direction: column;
            height: 100%;
            margin: 0 5%;
            
            /*头部*/
            .mmPlayer-header {
                height: 80px;
                line-height: 80px;
                font-size: 20px;
                text-align: center
            }
            
            /*主体*/
            .mmPlayer-container {
                position: relative;
                display: flex;
                flex: 1;
                box-sizing: border-box;
                padding-bottom: 30px;
                
                /*按钮部分*/
                .mmPlayer-btn {
                    position: absolute;
                    top: 0;
                    right: 400px;
                    left: 0;
                    display: flex;
                    text-align: center;
                    font-size: 0;
                    span {
                        display: inline-block;
                        height: 40px;
                        box-sizing: border-box;
                        margin-right: 6px;
                        padding: 0 23px;
                        border: 1px solid #c9c9c9;
                        border-radius: 2px;
                        font-size: 14px;
                        line-height: 40px;
                        overflow: hidden;
                        cursor: pointer;
                    }
                    .btn-player {
                        display: none;
                    }
                    .mmPlayer-search {
                        width: 104px;
                        position: relative;
                        transition: all .3s;
                        span {
                            position: absolute;
                            top: 0;
                            left: 0;
                            z-index: 1;
                            width: 100%;
                        }
                        input {
                            width: 100%;
                            height: 40px;
                            box-sizing: border-box;
                            outline: 0;
                            padding: 0 8px;
                            border-radius: 2px;
                            border: 1px solid #c9c9c9;
                            line-height: 40px;
                            color: #fff;
                            background-color: transparent;
                        }
                        &.input-focus {
                            flex: 1;
                            span {
                                display: none;
                            }
                        }
                    }
                }
                
                /*列表部分*/
                .mmPlayer-list-box {
                    flex: 1;
                    padding-top: 50px;
                }
                .mmPlayer-list {
                    width: 100%;
                    height: 100%;
                    overflow-x: hidden;
                    overflow-y: auto;
                    .mmPlayer-list-header .list-name {
                        padding-left: 40px;
                    }
                    .list-item {
                        display: flex;
                        width: 100%;
                        height: 50px;
                        line-height: 50px;
                        border-bottom: 1px solid rgba(255, 255, 255, .06);
                        &.on {
                            color: #fff;
                            .list-num {
                                font-size: 0;
                                background: url("assets/img/wave.gif") no-repeat center center;
                            }
                        }
                        &:hover {
                            .list-name .list-menu {
                                display: block;
                            }
                        }
                        .list-num {
                            display: block;
                            width: 30px;
                            margin-right: 10px;
                            text-align: center;
                        }
                        .list-name {
                            position: relative;
                            flex: 1;
                            & > span {
                                text-overflow: ellipsis;
                                overflow: hidden;
                                display: -webkit-box;
                                -webkit-line-clamp: 1;
                                -webkit-box-orient: vertical;
                            }
                            small {
                                margin-left: 5px;
                                font-size: 12px;
                                color: rgba(255, 255, 255, .5);
                            }
                            
                            /*hover菜单*/
                            .list-menu {
                                display: none;
                                position: absolute;
                                top: 50%;
                                right: 10px;
                                height: 36px;
                                font-size: 0;
                                transform: translateY(-50%);
                                span, a {
                                    display: inline-block;
                                    width: 36px;
                                    height: 36px;
                                    margin-right: 10px;
                                    background-image: url("assets/img/icon_list_menu.png");
                                    background-repeat: no-repeat;
                                    cursor: pointer;
                                }
                                .list-menu-icon-play {
                                    background-position: -80px 0;
                                    &.on {
                                        background-position: -80px -200px;
                                        &:hover {
                                            background-position: -120px -200px;
                                        }
                                    }
                                    &:hover {
                                        background-position: -120px 0;
                                    }
                                }
                                .list-menu-icon-down {
                                    background-position: -80px -120px;
                                    &:hover {
                                        background-position: -120px -120px;
                                    }
                                }
                            }
                        }
                        .list-artist, .list-time {
                            display: block;
                            width: 150px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }
                }
                
                /*音乐信息*/
                .mmPlayer-info-box {
                    width: 400px;
                    overflow: hidden;
                    .mmPlayer-info {
                        display: flex;
                        flex-direction: column;
        
                        /*封面信息*/
                        .mmPlayer-info-cover {
                            padding-bottom: 20px;
                            text-align: center;
                            dt {
                                position: relative;
                                width: 186px;
                                height: 186px;
                                margin: 0 auto 15px;
                                &:after {
                                    content: "";
                                    position: absolute;
                                    left: 9px;
                                    top: 0;
                                    width: 201px;
                                    height: 180px;
                                    background: url("assets/img/album_cover_player.png") 0 0 no-repeat;
                                }
                                img {
                                    vertical-align: middle;
                                    width: 186px;
                                    height: 186px;
                                }
                            }
                            dd {
                                height: 28px;
                                line-height: 28px;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }
                        }
        
                        /*歌词部分*/
                        .mmPlayer-lyric {
                            flex: 1;
                            overflow: hidden;
                            text-align: center;
                            /*-webkit-mask-image: linear-gradient(to bottom,rgba(255,255,255,0) 0,rgba(255,255,255,.6) 15%,rgba(255,255,255,1) 25%,rgba(255,255,255,1) 75%,rgba(255,255,255,.6) 85%,rgba(255,255,255,0) 100%);*/
                            .mmPlayer-lyric-items {
                                /*margin-top: 50%;*/
                                text-align: center;
                                line-height: 34px;
                                font-size: 14px;
                                transition: transform .6s ease-out;
                                overflow: hidden;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                .on {
                                    color: #40ce8f;
                                }
                            }
                        }
                    }
                }
            }
            
            /*底部mmPlayer-bar*/
            .mmPlayer-bar {
                display: flex;
                align-items: center;
                width: 100%;
                height: 100px;
                box-sizing: border-box;
                padding-bottom: 15px;
                .mmPlayer-bar-btn {
                    display: block;
                    background-image: url("assets/img/player.png");
                    cursor: pointer;
                }
                .btn-prev {
                    width: 19px;
                    min-width: 19px;
                    height: 20px;
                    background-position: 0 -30px;
                }
                .btn-play {
                    left: 76px;
                    width: 21px;
                    min-width: 21px;
                    height: 29px;
                    margin: 0 50px;
                    background-position: 0 0;
                    &.btn-play-pause {
                        background-position: -30px 0;
                    }
                }
                .btn-next {
                    left: 148px;
                    width: 19px;
                    min-width: 19px;
                    height: 20px;
                    background-position: 0 -52px;
                }
                .mmPlayer-music {
                    position: relative;
                    flex: 1;
                    box-sizing: border-box;
                    padding-left: 50px;
                    font-size: 12px;
                    .mmPlayer-bar-info {
                        padding: 0 70px 5px 0;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .mmPlayer-bar-time {
                        position: absolute;
                        top: 0;
                        right: 0;
                    }
                }
                .mmPlayer-bar-volume {
                    position: relative;
                    width: 100px;
                    padding-left: 50px;
                    .btn-volume {
                        position: absolute;
                        top: -4px;
                        left: 20px;
                        width: 26px;
                        height: 21px;
                        background-position: 0 -144px;
                        &.btn-volume-no {
                            background-position: 0 -182px;
                        }
                    }
                }
            }
        }
    }
    
    //当屏幕小于1100时
    @media (max-width: 1100px){
        #app {
            .mmPlayer-box {
                margin: 0 15px
            }
            .list-time {
                display: none;
            }
            .mmPlayer-info-box {
                width: 370px;
            }
        }
    }
    
    #app {
        .mobile {
            margin: 0 10px;
            .mmPlayer-header {
                display: none;
            }
            .mmPlayer-container {
                padding: 50px 0 0 0;
                .mmPlayer-list-box {
                    padding-top: 0;
                }
                .mmPlayer-info-box {
                    width: 100%;
                    overflow: hidden;
                    display: none;
                    &.on {
                        display: block;
                    }
                }
                .list-item {
                    .list-name {
                        box-sizing: border-box;
                        padding-right: 70px;
                        .list-menu {
                            display: block;
                            .list-menu-icon-play {
                                &.on {
                                    background-position: -80px -200px;
                                    &:hover {
                                        background-position: -80px -200px;
                                    }
                                }
                                &:hover {
                                    background-position: -80px 0;
                                }
                            }
                            .list-menu-icon-down {
                                display: none;
                            }
                        }
                    }
                }
            }
            .mmPlayer-btn {
                left: -15px;
                right: -15px;
                margin: 0;
                text-align: center;
                background: rgba(0, 0, 0, .3);
                span {
                    flex: 1;
                    border: 0;
                    padding: 0;
                    margin: 0;
                    color: @color;
                    &.on {
                        color: #fff;
                        border-bottom: 2px solid rgba(0, 0, 0, .8);
                    }
                }
                .btn-player {
                    display: inline-block;
                }
            }
            .mmPlayer-bar {
                height: 60px;
                padding: 15px 0;
            }
        }
    }
    
    //当屏幕小于560时
    @media (max-width: 560px){
        #app {
            .list-artist {
                width: 25%;
            }
            .btn-play {
                margin: 0 20px;
            }
            .mmPlayer-music {
                padding-left: 20px;
            }
        }
    }
</style>
