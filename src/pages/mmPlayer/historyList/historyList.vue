<template>
    <div class="historyList">
        <music-list :list="historyList" @select="selectItem" @del="deleteItem">
            <div slot="listBtn" class="list-btn">
                <span @click="click">清空列表</span>
            </div>
        </music-list>
    </div>
</template>

<script>
    import {topListMm} from 'api/music'
    import {mapGetters, mapMutations, mapActions} from 'vuex'
    import MusicList from 'components/music-list/music-list-del'
    
    export default {
        name: "history-list",
        components: {
            MusicList
        },
        computed: {
            ...mapGetters([
                'historyList',
                'playing',
                'currentMusic',
            ])
        },
        methods: {
            click(){
                this.clearHistory();
                this.$mmToast('列表清空成功')
            },
            selectItem(item,index){
                if (item.id === this.currentMusic.id && this.playing) {
                    this.setPlaying(false)
                } else {
                    this.selectPlay({
                        list: this.historyList,
                        index
                    })
                }
            },
            deleteItem(index){
                let list = this.historyList.slice();
                list.splice(index,1);
                this.removeHistory(list);
                this.$mmToast('删除成功')
            },
            ...mapMutations({
                setPlaying: 'SET_PLAYING'
            }),
            ...mapActions([
                'selectPlay',
                'clearHistory',
                'removeHistory'
            ])
        }
    }
</script>

<style lang="less" scoped>
    @import "../../../assets/css/var";
    
    .historyList {
        width: 100%;
        height: 100%;
        .musicList {
            width: 100%;
            height: 100%;
            .list-btn {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 50px;
                span{
                    padding: 5px 20px;
                    cursor: pointer;
                    user-select: none;
                    &:hover {
                        color: @text_color_active;
                    }
                }
            }
        }
    }
</style>
