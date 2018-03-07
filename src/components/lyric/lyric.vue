<template>
    <div>
        <!--封面-->
        <dl class="music-info">
            <dt>
                <img :src="musicPicUrl">
            </dt>
            <template v-if="currentMusic.id">
                <dd>歌曲名：{{currentMusic.name}}</dd>
                <dd>歌手名：{{currentMusic.singer}}</dd>
                <dd>专辑名：{{currentMusic.album}}</dd>
            </template>
        </dl>
        <!--歌词-->
        <div class="music-lyric" ref="musicLyric">
            <div class="music-lyric-items" :style="lyricTop">
                <template v-if="lyric.length>0">
                    <p :class="{on:lyricIndex===index}" v-for="(item,index) in lyric" :key="index">{{item.text}}</p>
                </template>
                <p v-else-if="!currentMusic.id">还没有播放音乐哦！</p>
                <p v-else>歌词加载失败！</p>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    
    export default {
        name: "lyric",
        props: {
            lyric: {
                type: Array,
                default: []
            },
            lyricIndex: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                top: 0
            }
        },
        mounted() {
            this.$nextTick(() => {
                let height = this.$refs.musicLyric.offsetHeight;
                this.top = Math.floor(height / 34 / 2)
                //console.log(this.top)
            })
        },
        computed: {
            musicPicUrl() {
                return this.currentMusic.id ? this.currentMusic.image : require('../../assets/img/player_cover.png')
            },
            lyricTop() {
                return `transform :translate3d(0px, ${-34*(this.lyricIndex-this.top)}px, 0px)`
            },
            ...mapGetters([
                'currentMusic'
            ])
        }
    }
</script>

<style lang="less" scoped>
    @import "~assets/css/var";
    
    .music-info {
        padding-bottom: 20px;
        text-align: center;
        font-size: @font_size_medium;
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
                background: url("../../assets/img/album_cover_player.png") 0 0 no-repeat;
            }
            img {
                vertical-align: middle;
                width: 186px;
                height: 186px;
            }
        }
        dd {
            height: 30px;
            line-height: 30px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
    
    /*歌词部分*/
    .music-lyric {
        position: absolute;
        top: 315px;
        right: 0;
        bottom: 0;
        left: 0;
        overflow: hidden;
        text-align: center;
        -webkit-mask-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, .6) 15%, rgba(255, 255, 255, 1) 25%, rgba(255, 255, 255, 1) 75%, rgba(255, 255, 255, .6) 85%, rgba(255, 255, 255, 0) 100%);
        .music-lyric-items {
            text-align: center;
            line-height: 34px;
            font-size: @font_size_small;
            transform: translate3d(0, 0, 0);
            transition: transform .6s ease-out;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            .on {
                color: @lyric_color_active;
            }
        }
    }
</style>
