<template>
    <div class="search">
        <mm-loading v-model="mmLoadShow" :loadingBgColor="'rgba(0,0,0,.6)'"></mm-loading>
        <div class="search-head">
            <span v-for="(item,index) in Artists" :key="index" @click="clickHot(item.name)">{{item.name}}</span>
            <input class="search-input" type="text" placeholder="音乐/歌手" v-model.trim="searchValue"
                   @keyup.enter="onEnter">
        </div>
        <music-list ref="musicList" :list="list" :listType="2" @select="selectItem" @pullUp="pullUpLoad"></music-list>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import {getTopArtists, search,getMusicDetail} from 'api/music'
    import {createSerach} from 'assets/js/song'
    import MmLoading from 'base/mm-loading/mm-loading'
    import MusicList from 'components/music-list/music-list'
    import {loadMixin} from "assets/js/mixin";
    
    export default {
        name: "search",
        mixins: [loadMixin],
        components: {
            MmLoading,
            MusicList
        },
        data() {
            return {
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
                this.mmLoadShow = true;
                this.page = 0;
                if (this.list.length > 0) {
                    this.$refs.musicList.scrollTop();
                }
                search(this.searchValue)
                    .then(res => {
                        if (res.data.code === 200) {
                            this.list = this._formatSongs(res.data.result.songs);
                            this._hideLoad()
                        }
                    })
            },
            //上拉加载
            pullUpLoad() {
                this.mmLoadShow = true;
                this.page += 1;
                search(this.searchValue, this.page)
                    .then(res => {
                        if (res.data.code === 200) {
                            if(!res.data.result.songs){
                                this.$mmToast('没有更多歌曲啦！');
                                this.mmLoadShow = false;
                                return
                            }
                            this.list = this.list.concat(this._formatSongs(res.data.result.songs))
                            this._hideLoad();
                        }
                    })
            },
            //播放歌曲
            async selectItem(music) {
                let image = await this._getMusicDetail(music.id);
                music.image = image;
                this.selectAddPlay(music)
            },
            _getMusicDetail(id){
                return getMusicDetail(id)
                    .then(res => {
                        if(res.data.code === 200){
                            return res.data.songs[0].al.picUrl
                        }
                    })
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
            ...mapActions([
                'selectAddPlay'
            ])
        }
    }
</script>

<style lang="less" scoped>
    @import "~assets/css/var";
    
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
                border: 1px solid @btn_color;
                outline: 0;
                background: transparent;
                color: @text_color_active;
                font-size: @font_size_medium;
                box-shadow: 0 0 1px 0 #fff inset;
                &::placeholder {
                    color: @text_color;
                }
            }
        }
        .musicList {
            width: 100%;
            height: calc(~'100% - 50px');
        }
    }
</style>
