<template>
    <div class="historyList">
        <music-list :list="historyList">
            <div slot="listBtn" class="list-btn">
                <span @click="click">清空列表</span>
            </div>
        </music-list>
    </div>
</template>

<script>
    import {topListMm} from 'api/music'
    import {mapGetters,mapActions} from 'vuex'
    import MusicList from 'components/music-list/music-list'
    
    export default {
        name: "history-list",
        components: {
            MusicList
        },
        computed: {
            ...mapGetters([
                'historyList'
            ])
        },
        methods: {
            click(){
                this.clearHistory();
                this.$mmToast('列表清空成功')
            },
            ...mapActions([
                'clearHistory'
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
