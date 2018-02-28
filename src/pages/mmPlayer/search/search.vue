<template>
    <div class="search">
        <mm-loading v-model="show" :loadingBgColor="'rgba(0,0,0,.6)'"></mm-loading>
        <div class="search-head">
            <span v-for="(item,index) in Artists" :key="index" @click="clickHot(item.name)">{{item.name}}</span>
            <input class="search-input" type="text" placeholder="音乐/歌手" v-model.trim="searchValue"
                   @keyup.enter="onEnter">
        </div>
        <div class="musicList">
            <div class="list-item list-header">
                <span class="list-name">歌曲</span>
                <span class="list-artist">歌手</span>
                <span class="list-time">专辑</span>
            </div>
            <div ref="listContent" class="list-content" v-if="list.length>0" @scroll="listScroll($event)">
                <div class="list-item" :class="{'on':playing&&currentMusic.id===item.id}" v-for="(item,index) in list" :key="item.id">
                    <span class="list-num" v-text="index+1"></span>
                    <div class="list-name">
                        <span>{{item.name}}</span>
                        <div class="list-menu">
                        <span class="list-menu-icon-play" :class="{'on':playing&&currentMusic.id===item.id}"
                              @click="selectItem(item)"></span>
                        </div>
                    </div>
                    <span class="list-artist">{{item.singer}}</span>
                    <span class="list-time">{{item.album}}</span>
                </div>
            </div>
            <div class="list-content" v-else>
                <div class="list-item list-item-no">弄啥呢，怎么啥也没有！！！</div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapMutations, mapActions} from 'vuex'
    import {getTopArtists, search,getMusicDetail} from 'api/music'
    import {createSerach} from 'assets/js/song'
    import MmLoading from 'base/mm-loading/mm-loading'
    
    export default {
        name: "search",
        components: {
            MmLoading
        },
        data() {
            return {
                show: true,//loading
                Artists: [],//热门搜索歌手数组
                list: [],//搜索数组
                page: 0,//分页
                lockUp: true,//是否锁定上拉加载事件,默认锁定
            }
        },
        computed: {
            ...mapGetters([
                'playing',
                'currentMusic',
            ])
        },
        watch: {
            list(newList,oldList){
                if(newList.length !==oldList.length){
                    this.lockUp = false
                }else if(newList[newList.length-1].id !== oldList.length>0&&oldList[oldList.length-1].id){
                    this.lockUp = false
                }
            }
        },
        created() {
            getTopArtists(0, 5)
                .then(res => {
                    if (res.data.code === 200) {
                        this.Artists = res.data.artists;
                        this._hideLoad()
                    }
                })
        },
        methods: {
            clickHot(name) {
                this.searchValue = name;
                this.onEnter()
            },
            onEnter() {
                if (this.searchValue.replace(/(^\s+)|(\s+$)/g, "") === '') {
                    this.$mmToast('搜索内容不能为空！');
                    return
                }
                this.show = true;
                this.page = 0;
                if (this.list.length > 0) {
                    this.$refs.listContent.scrollTop = 0;
                }
                search(this.searchValue)
                    .then(res => {
                        if (res.data.code === 200) {
                            this.list = this._formatSongs(res.data.result.songs);
                            this._hideLoad()
                        }
                    })
            },
            listScroll(e){
                if(this.lockUp){
                    return
                }
                let scrollTop = e.target.scrollTop,
                    scrollHeight = e.target.scrollHeight,
                    height = e.target.offsetHeight;
                if(scrollTop + height >= scrollHeight){
                    this.lockUp = true;//锁定上拉加载事件
                    this.pullUpLoad()//触发上拉加载事件
                }
            },
            //上拉加载
            pullUpLoad() {
                this.show = true;
                this.page += 1;
                search(this.searchValue, this.page)
                    .then(res => {
                        if (res.data.code === 200) {
                            if(!res.data.result.songs){
                                this.$mmToast('没有更多歌曲啦！');
                                this.show = false;
                                return
                            }
                            this.list = this.list.concat(this._formatSongs(res.data.result.songs))
                            this._hideLoad();
                        }
                    })
            },
            //播放歌曲
            async selectItem(item) {
                let image = await this._getMusicDetail(item.id);
                item.image = image;
                if (item.id === this.currentMusic.id && this.playing) {
                    this.setPlaying(false)
                } else {
                    this.selectAddPlay({item})
                }
            },
            _getMusicDetail(id){
                return getMusicDetail(id)
                    .then(res => {
                        if(res.data.code === 200){
                            return res.data.songs[0].al.picUrl
                        }
                    })
            },
            _hideLoad(){
                let timer;
                clearTimeout(timer);
                timer = setTimeout(()=>{
                    this.show = false
                },200)
            },
            _formatSongs(list) {
                let ret = [];
                list.forEach((item) => {
                    const musicData = item;
                    if (musicData.id) {
                        ret.push(createSerach(musicData))
                    }
                });
                return ret
            },
            ...mapMutations({
                setPlaying: 'SET_PLAYING'
            }),
            ...mapActions([
                'selectAddPlay'
            ])
        }
    }
</script>

<style lang="less" scoped>
    @import "../../../assets/css/var";
    
    .search {
        position: relative;
        width: 100%;
        height: 100%;
        .search-head {
            display: flex;
            height: 40px;
            padding: 10px;
            background: rgba(0, 0, 0, .2);
            span {
                line-height: 40px;
                margin: 0 10px;
                cursor: pointer;
                &:hover {
                    color: @text_color_active;
                }
                @media (max-width: 640px) {
                    &{
                        display: none;
                    }
                }
            }
            .search-input {
                flex: 1;
                height: 40px;
                box-sizing: border-box;
                margin: 0 10px;
                padding: 0 15px;
                /*border-radius: 30px;*/
                border: 1px solid @btn_color;
                outline: 0;
                background: transparent;
                color: @text_color_active;
                font-size: @font_size_medium;
                &::placeholder {
                    color: @text_color;
                }
                /*:focus*/
                & {
                    box-shadow: 0 0 1px 0 #fff inset;
                }
            }
        }
        .musicList {
            width: 100%;
            height: calc(~'100% - 50px');
            .list-header {
                border-bottom: 1px solid @list_head_line_color;
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
            .list-content-no {
                display: flex;
                width: 100%;
                height: 200px;
                color: @text_color_active;
            }
    
            .list-item {
                display: flex;
                width: 100%;
                height: 50px;
                line-height: 50px;
                border-bottom: 1px solid @list_item_line_color;
                &.list-item-no {
                    justify-content: center;
                    align-items: center;
                }
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
                    .list-menu {
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
    }
</style>
