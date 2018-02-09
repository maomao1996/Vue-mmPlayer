<template>
    <div class="search">
        <div class="search-head">
            <span v-for="(item,index) in Artists" :key="index">{{item.name}}</span>
            <input class="search-input" type="text" placeholder="音乐/歌手">
        </div>
        <music-list :list="playlist"></music-list>
    </div>
</template>

<script>
    import {mapGetters,mapMutations} from 'vuex'
    import {topList,getTopArtists} from 'api/music'
    import MusicList from 'components/music-list/music-list'
    
    export default {
        name: "search",
        components: {
            MusicList
        },
        data(){
           return {
               Artists: []
           }
        },
        created(){
            getTopArtists(0,5)
                .then((res) => {
                    if(res.data.code===200){
                        this.Artists = res.data.artists
                    }
                })
            topList(1)
                .then((res) => {
                    if(res.status===200){
                        this.setPlaylist(res.data.playlist.tracks)
                    }
                })
        },
        computed: {
            ...mapGetters([
                'playlist'
            ])
        },
        methods: {
            ...mapMutations({
                setPlaylist: 'SET_PLAYLIST'
            })
        }
    }
</script>

<style lang="less" scoped>
    @import "../../../assets/css/var";
    
    .search {
        width: 100%;
        height: 100%;
        .search-head {
            display: flex;
            height: 40px;
            padding: 10px;
            background: rgba(0,0,0,.2);
            span {
                line-height: 40px;
                margin: 0 10px;
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
        }
    }
</style>
