<template>
    <div class="musicList">
        <div class="list-item list-header">
            <span class="list-name">歌曲</span>
            <span class="list-artist">歌手</span>
            <span class="list-time">时长</span>
        </div>
        <div ref="listContent" class="list-content" v-if="list.length>0" @scroll="listScroll($event)">
            <div class="list-item" :class="{'on':playing&&currentMusic.id===item.id}" v-for="(item,index) in list" :key="item.id">
                <span class="list-num" v-text="index+1"></span>
                <div class="list-name">
                    <span>{{item.name}}</span>
                    <div class="list-menu">
                        <span class="list-menu-icon-play" :class="{'on':playing&&currentMusic.id===item.id}"
                              @click="selectItem(item,index)"></span>
                    </div>
                </div>
                <span class="list-artist">{{item.singer}}</span>
                <span class="list-time">
                    {{item.duration | formatDuration}}
                    <i class="list-menu-icon-del" @click="deleteItem(index)"></i>
                </span>
            </div>
            <slot name="listBtn"></slot>
        </div>
        <div class="list-content" v-else>
            <div class="list-item list-item-no">弄啥呢，怎么啥也没有！！！</div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    
    export default {
        name: "music-list-del",
        props: {
            list: {
                type: Array,
                default: []
            }
        },
        data() {
            return {
                /**
                 * 是否锁定上拉加载事件,默认锁定
                 */
                lockUp: true,
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
        methods: {
            listScroll(e){
                if(this.lockUp){
                    return
                }
                let scrollTop = e.target.scrollTop,
                    scrollHeight = e.target.scrollHeight,
                    height = e.target.offsetHeight;
                if(scrollTop + height >= scrollHeight){
                    this.lockUp = true;//锁定上拉加载
                    this.$emit('pullUp')//触发上拉加载事件
                }
            },
            scrollTop(){
                this.$refs.listContent.scrollTop = 0;
            },
            selectItem(item,index){
                this.$emit('select',item,index)//触发点击播放事件
            },
            deleteItem(index){
                this.$emit('del',index)//触发删除事件
            }
        },
        filters: {
            formatDuration(value){
                let other = value % 3600;
                let minutes = Math.floor(other / 60);
                let seconds = Math.floor(other % 60);
                return (minutes<10?'0'+minutes:minutes)+':'+(seconds<10?'0'+seconds:seconds)
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../../assets/css/var";
    
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
                background: url("../../assets/img/wave.gif") no-repeat center center;
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
                    background-image: url("../../assets/img/icon_list_menu.png");
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
        .list-artist {
            display: block;
            width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
                background-image: url("../../assets/img/icon_list_menu.png");
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
</style>
