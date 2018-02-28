import {mapGetters, mapMutations, mapActions} from 'vuex'

export const listMixin = {
    computed: {
        ...mapGetters([
            'playing',
            'currentMusic',
        ])
    },
    methods: {
        selectItem(item, index) {
            if (item.id === this.currentMusic.id && this.playing) {
                this.setPlaying(false)
            } else {
                this.selectPlay({
                    list: this.list,
                    index
                })
            }
        },
        ...mapMutations({
            setPlaying: 'SET_PLAYING'
        }),
        ...mapActions([
            'selectPlay'
        ])
    }
}
