<template>
    <div class="playList">
        <mm-loading v-model="mmLoadShow" :loadingBgColor="'rgba(0,0,0,.6)'"></mm-loading>
        <music-list :list="playlist" @select="selectItem" @del="deleteItem">
            <!--<div slot="listBtn" class="list-btn">-->
            <!--<span @click="click">清空列表</span>-->
            <!--</div>-->
        </music-list>
    </div>
</template>

<script>
    import {mapGetters, mapMutations, mapActions} from 'vuex'
    import {topList} from 'api/music'
    import MusicList from 'components/music-list/music-list-del'
    import MmLoading from 'base/mm-loading/mm-loading'
    import {createTopList} from 'assets/js/song'
    import {loadMixin} from "assets/js/mixin";
    
    export default {
        name: "play-list",
        mixins: [loadMixin],
        components: {
            MusicList,
            MmLoading
        },
        created() {
            if (this.playlist.length > 0) {
                this.mmLoadShow = false;
                return
            }
            topList(1)
                .then((res) => {
                    if (res.status === 200) {
                        let list = this._formatSongs(res.data.playlist.tracks);
                        this.setPlaylist(list);
                        this._hideLoad()
                    }
                })
        },
        computed: {
            ...mapGetters([
                'playing',
                'playlist',
                'currentMusic'
            ])
        },
        methods: {
            click() {
                this.clearPlaylist();
                this.$mmToast('列表清空成功')
            },
            selectItem(item, index) {
                if (item.id === this.currentMusic.id && this.playing) {
                    this.setPlaying(false)
                } else {
                    this.setCurrentIndex(index);
                    this.setPlaying(true)
                }
            },
            deleteItem(index) {
                let list = this.playlist.slice();
                list.splice(index, 1);
                this.removerPlayListItem({list,index});
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
                setPlaying: 'SET_PLAYING',
                setCurrentIndex: 'SET_CURRENTINDEX',
                setPlaylist: 'SET_PLAYLIST',
                clearPlaylist: 'CLEAR_PLAYLIST'
            }),
            ...mapActions([
                'removerPlayListItem'
            ])
        }
    }
</script>

<style lang="less">
    @import "../../../assets/css/var";
    
    .playList {
        position: relative;
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
