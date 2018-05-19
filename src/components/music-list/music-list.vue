<template>
    <!--歌曲列表-->
    <div class="musicList">
        <template v-if="list.length>0">
            <div class="list-item list-header">
                <span class="list-name">歌曲</span>
                <span class="list-artist">歌手</span>
                <span v-if="listType === 1" class="list-time">时长</span>
                <span v-else class="list-album">专辑</span>
            </div>
            <div ref="listContent" class="list-content" @scroll="listScroll($event)">
                <div class="list-item" :class="{'on':playing&&currentMusic.id===item.id}" v-for="(item,index) in list"
                     :key="item.id" @dblclick="selectItem(item,index,$event)">
                    <span class="list-num" v-text="index+1"></span>
                    <div class="list-name">
                        <span>{{item.name}}</span>
                        <div class="list-menu">
                        <span class="list-menu-icon-play" :class="{'on':playing&&currentMusic.id===item.id}"
                              @click.stop="selectItem(item,index)"></span>
                        </div>
                    </div>
                    <span class="list-artist">{{item.singer}}</span>
                    <span class="list-time" v-if="listType === 1">{{item.duration | formatDuration}}
                    <i class="list-menu-icon-del" @click.stop="deleteItem(index)"></i>
                </span>
                    <span class="list-album" v-else>{{item.album}}</span>
                </div>
                <slot name="listBtn"/>
            </div>
        </template>
        <mm-no-result v-else title="弄啥呢，怎么啥也没有！！！"/>
    </div>
</template>

<script>
    import {debounce} from 'assets/js/util'
    import {getMusicUrl} from 'api'
    import {mapGetters, mapMutations} from 'vuex'
    import {addZero} from 'assets/js/util'
    import MmNoResult from 'base/mm-no-result/mm-no-result'
    
    export default {
        name: "music-list",
        components: {
            MmNoResult
        },
        props: {
            // 歌曲数据
            list: {
                type: Array,
                default: []
            },
            /**
             *  0：显示专辑栏目（默认）
             *  1：显示时长栏目
             */
            listType: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                lockUp: true,//是否锁定滚动加载事件,默认锁定
            }
        },
        computed: {
            ...mapGetters([
                'playing',
                'currentMusic',
            ])
        },
        watch: {
            list(newList, oldList) {
                if (this.listType !== 2) {
                    return
                }
                if (newList.length !== oldList.length) {
                    this.lockUp = false
                } else if (newList[newList.length - 1].id !== oldList.length > 0 && oldList[oldList.length - 1].id) {
                    this.lockUp = false
                }
            }
        },
        methods: {
            // 滚动事件
            listScroll(e) {
                if (this.listType !== 2) {
                    return
                }
                if (this.lockUp) {
                    return
                }
                let scrollTop = e.target.scrollTop,
                    scrollHeight = e.target.scrollHeight,
                    height = e.target.offsetHeight;
                if (scrollTop + height >= scrollHeight) {
                    this.lockUp = true;//锁定滚动加载
                    this.$emit('pullUp')//触发滚动加载事件
                }
            },
            // 回到顶部
            scrollTop() {
                this.$refs.listContent.scrollTop = 0;
            },
            // 播放暂停事件
            selectItem(item, index, e) {
                if (e && /list-menu-icon-del/.test(e.target.className)) {
                    return
                }
                if (item.id === this.currentMusic.id && this.playing) {
                    this.setPlaying(false);
                    return
                }
                getMusicUrl(item.id)
                    .then(res => {
                        if (!res.data.data[0].url) {
                            this.$mmToast('当前音乐无法播放，请播放其他音乐')
                        } else {
                            this.$emit('select', item, index)//触发点击播放事件
                        }
                    });
            },
            // 删除事件
            deleteItem(index) {
                this.$emit('del', index)//触发删除事件
            },
            ...mapMutations({
                setPlaying: 'SET_PLAYING'
            })
        },
        filters: {
            formatDuration(value) {
                let other = value % 3600;
                let minutes = Math.floor(other / 60);
                let seconds = Math.floor(other % 60);
                return `${addZero(minutes)}:${addZero(seconds)}`
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "~assets/css/var";
    @import "~assets/css/mixin";
    
    .list-header {
        border-bottom: 1px solid @list_head_line_color;
        color: @text_color_active;
        .list-name {
            padding-left: 40px;
        }
    }
    
    .list-content {
        width: 100%;
        height: calc(~'100% - 60px');
        overflow-x: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
    
    .list-no {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        color: @text_color;
    }
    
    .list-item {
        display: flex;
        width: 100%;
        height: 50px;
        border-bottom: 1px solid @list_item_line_color;
        line-height: 50px;
        overflow: hidden;
        &.list-item-no {
            justify-content: center;
            align-items: center;
        }
        &.on {
            color: #fff;
            .list-num {
                font-size: 0;
                background: url("~assets/img/wave.gif") no-repeat center center;
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
        &:not([class*="list-header"]):hover {
            .list-name {
                padding-right: 80px;
                .list-menu {
                    display: block;
                }
            }
            .list-time {
                font-size: 0;
                .list-menu-icon-del {
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
                    background-image: url("~assets/img/icon_list_menu.png");
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
        .list-artist, .list-album {
            display: block;
            width: 150px;
            .no-wrap();
        }
        .list-time {
            display: block;
            width: 60px;
            position: relative;
            .list-menu-icon-del {
                display: none;
                position: absolute;
                top: 50%;
                left: 0;
                width: 36px;
                height: 36px;
                background-image: url("~assets/img/icon_list_menu.png");
                background-repeat: no-repeat;
                background-position: -80px -160px;
                cursor: pointer;
                transform: translateY(-50%);
                &:hover {
                    background-position: -120px -160px;
                }
            }
        }
    }
    
    @media (max-width: 960px) {
        .list-item .list-name {
            padding-right: 70px;
        }
    }
    
    @media (max-width: 768px) {
        .list-item {
            .list-name .list-menu {
                display: block;
            }
            .list-artist, .list-album {
                width: 20%;
            }
        }
    }
    
    @media (max-width: 640px) {
        .list-item {
            .list-artist {
                width: 80px;
            }
            .list-album, .list-time {
                display: none;
            }
        }
    }
</style>
