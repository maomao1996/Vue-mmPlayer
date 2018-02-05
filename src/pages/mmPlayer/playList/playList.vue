<template>
    <div class="playList">
        <div class="list-item list-header">
            <span class="list-name">歌曲</span>
            <span class="list-artist">歌手</span>
            <span class="list-time">专辑</span>
        </div>
        <div class="list-content" v-if="playlist.length>0">
            <div class="list-item" :class="{'on':playing&&currentMusic.id===item.id}" v-for="(item,index) in playlist" :key="index">
                <span class="list-num" v-text="index+1"></span>
                <div class="list-name">
                    <span>{{item.name}}</span>
                    <div class="list-menu">
                        <span class="list-menu-icon-play" :class="{'on':playing&&currentMusic.id===item.id}" @click="selectItem(item,index)"></span>
                    </div>
                </div>
                <span class="list-artist">{{item.ar[0].name}}</span>
                <span class="list-time">{{item.al.name}}</span>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters,mapMutations,mapActions} from 'vuex'
    import {topList} from 'api/music'
    
    export default {
        name: "play-list",
        data() {
            return {
                list: []
            }
        },
        computed: {
            ...mapGetters([
                'playing',
                'playlist',
                'currentIndex',
                'currentMusic',
            ])
        },
        created(){
            if(this.playlist.length>0){
                return
            }
            topList(1)
                .then((res) => {
                    if(res.status===200){
                        this.setPlaylist(res.data.playlist.tracks)
                    }
                })
        },
        methods: {
            selectItem(item,index) {
                if(item.id === this.currentMusic.id&&this.playing){
                    this.setPlaying(false)
                }else{
                    this.selectPlay({
                        list: this.playlist,
                        index
                    })
                }
            },
            ...mapMutations({
                setPlaying: 'SET_PLAYING',
                setPlaylist: 'SET_PLAYLIST'
            }),
            ...mapActions([
                'selectPlay'
            ])
        }
    }
</script>

<style lang="less" scoped>
    .playList {
        width: 100%;
        height: 100%;
        .list-header {
            border-bottom: 1px solid rgba(255, 255, 255, .8);
            .list-name {
                padding-left: 40px;
            }
        }
        .list-content {
            width: 100%;
            height: calc(~'100% - 60px');
            overflow-x: hidden;
            overflow-y: auto;
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
                    background: url("../../../assets/img/wave.gif") no-repeat center center;
                }
            }
            &:hover {
                .list-name {
                    padding-right: 80px;
                    .list-menu {
                        display: block;
                    }
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
                box-sizing: border-box;
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
        @media (max-width: 960px) {
            .list-item .list-name {
                padding-right: 70px;
                .list-menu{
                    display: block;
                }
            }
        }
        @media (max-width: 768px) {
            .list-item {
                .list-artist, .list-time {
                    width: 20%;
                }
            }
        }
        @media (max-width: 640px) {
            .list-item {
                .list-artist {
                    width: 80px;
                }
                .list-time {
                    display: none;
                }
            }
        }
    }
</style>
