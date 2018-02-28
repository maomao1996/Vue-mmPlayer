<template>
    <div class="playList">
        <music-list :list="playlist" @del="deleteItem">
            <!--<div slot="listBtn" class="list-btn">-->
                <!--<span @click="click">清空列表</span>-->
            <!--</div>-->
        </music-list>
    </div>
</template>

<script>
    import {mapGetters, mapMutations} from 'vuex'
    import {topList} from 'api/music'
    import MusicList from 'components/music-list/music-list-del'
    import {createTopList} from 'assets/js/song'
    
    export default {
        name: "play-list",
        components: {
            MusicList
        },
        created() {
            if (this.playlist.length > 0) {
                return
            }
            topList(1)
                .then((res) => {
                    if (res.status === 200) {
                        let list = this._formatSongs(res.data.playlist.tracks);
                        this.setPlaylist(list)
                    }
                })
        },
        computed: {
            ...mapGetters([
                'playlist'
            ])
        },
        methods: {
            click() {
                this.clearPlaylist();
                this.$mmToast('列表清空成功')
            },
            deleteItem(index){
                let list = this.playlist.slice();
                list.splice(index,1);
                this.setPlaylist(list);
                this.$mmToast('删除成功')
            },
            _formatSongs(list) {
                let ret = [];
                list.forEach((item) => {
                    const musicData = item;
                    if (musicData.id) {
                        ret.push(createTopList(musicData))
                    }
                });
                return ret
            },
            ...mapMutations({
                setPlaylist: 'SET_PLAYLIST',
                clearPlaylist: 'CLEAR_PLAYLIST'
            })
        }
    }
</script>

<style lang="less">
    @import "../../../assets/css/var";
    
    .playList {
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
                span {
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
