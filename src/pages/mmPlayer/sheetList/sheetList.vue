<template>
    <div class="playList">
        <div class="list-item list-header">
            <span class="list-name">歌曲</span>
            <span class="list-artist">歌手</span>
            <span class="list-time">专辑</span>
        </div>
        <div class="list-item" v-for="(item,index) in currentList" :key="index">
            <span class="list-num" v-text="index+1"></span>
            <div class="list-name">
                <span>{{item.name}}</span>
                <div class="list-menu">
                    <span class="list-menu-icon-play"></span>
                    <a :href="'https://music.163.com/song/media/outer/url?id='+item.id+'.mp3'"
                       class="list-menu-icon-down" :download="item.name"></a>
                </div>
            </div>
            <span class="list-artist">{{item.artist}}</span>
            <span class="list-time">{{item.album}}</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "play-list",
        data() {
            return {
                currentList: [
                    {
                        id: 432506345,
                        name: "童话镇",
                        artists: [
                            {
                                id: 1137098,
                                name: "陈一发儿",
                                picUrl: null,
                                alias: [],
                                albumSize: 0,
                                picId: 0,
                                img1v1Url: "http://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
                                img1v1: 0,
                                trans: null
                            }
                        ],
                        album: {
                            id: 34898300,
                            name: "童话镇",
                            artist: {
                                id: 0,
                                name: "",
                                picUrl: null,
                                alias: [],
                                albumSize: 0,
                                picId: 0,
                                img1v1Url: "http://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
                                img1v1: 0,
                                trans: null
                            },
                            publishTime: 1474992000007,
                            size: 1,
                            copyrightId: 0,
                            status: 0,
                            picId: 3394192426154346
                        },
                        duration: 257914,
                        copyrightId: 0,
                        status: 0,
                        alias: [],
                        rtype: 0,
                        ftype: 0,
                        mvid: 0,
                        fee: 0,
                        rUrl: null
                    }, {
                        id: 452986458,
                        name: "红昭愿",
                        artists: [
                            {
                                id: 12174521,
                                name: "音阙诗听",
                                picUrl: null,
                                alias: [],
                                albumSize: 0,
                                picId: 0,
                                img1v1Url: "http://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
                                img1v1: 0,
                                trans: null
                            }
                        ],
                        album: {
                            id: 35114938,
                            name: "红昭愿",
                            artist: {
                                id: 0,
                                name: "",
                                picUrl: null,
                                alias: [],
                                albumSize: 0,
                                picId: 0,
                                img1v1Url: "http://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
                                img1v1: 0,
                                trans: null
                            },
                            publishTime: 1484064000007,
                            size: 2,
                            copyrightId: 30002,
                            status: 0,
                            picId: 109951162951242160
                        },
                        duration: 173217,
                        copyrightId: 30002,
                        status: 0,
                        alias: [],
                        rtype: 0,
                        ftype: 0,
                        mvid: 0,
                        fee: 8,
                        rUrl: null
                    }
                ],//音乐列表
                historyList: [],//播放历史
            }
        }
    }
</script>

<style lang="less" scoped>
    .playList {
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        .list-header .list-name {
            padding-left: 40px;
        }
        .list-item {
            display: flex;
            width: 100%;
            height: 50px;
            line-height: 50px;
            border-bottom: 1px solid rgba(255, 255, 255, .06);
            &.on {
                .list-num {
                    font-size: 0;
                    background: url("../../../assets/img/wave.gif") no-repeat center center;
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
                        background-image: url("../../../assets/img/icon_list_menu.png");
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
</style>
