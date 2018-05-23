<template>
    <div id="app">
        <!--主体-->
        <mm-header/>
        <router-view class="router-view"/>
        
        <!--更新说明-->
        <mm-dialog ref="versionDialog" :dialogType="1" headText="更新提示" :bodyText="versionBody"/>
        
        <!--播放器-->
        <audio ref="mmPlayer"></audio>
    </div>
</template>

<script>
    const pkg = require('../package.json');
    import {mapMutations} from 'vuex'
    import MmHeader from 'components/mm-header/mm-header'
    import MmDialog from 'base/mm-dialog/mm-dialog'
    import {getVersion, setVersion} from "assets/js/storage";
    
    export default {
        name: "app",
        components: {
            MmHeader, MmDialog
        },
        created() {
            //设置title
            let OriginTitile = document.title, titleTime;
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    document.title = '死鬼去哪里了！';
                    clearTimeout(titleTime);
                } else {
                    document.title = '(つェ⊂)咦!又好了!';
                    titleTime = setTimeout(function () {
                        document.title = OriginTitile;
                    }, 2000);
                }
            });
            //设置audio元素
            this.$nextTick(() => {
                this.setAudioele(this.$refs.mmPlayer)
            });
            //首次加载完成移除动画
            if (document.querySelector('#appLoading')) {
                document.querySelector('#appLoading').classList.add("removeAnimate");
                setTimeout(() => {
                    document.body.removeChild(document.getElementById('appLoading'));
                    let version = getVersion(), newVersion = pkg.version;
                    if (version !== null) {
                        setVersion(newVersion);
                        if (version !== newVersion) {
                            this.$refs.versionDialog.show()
                        }
                    } else {
                        setVersion(newVersion);
                        this.$refs.versionDialog.show()
                    }
                }, 500)
            }
        },
        computed: {
            versionBody() {
                return `<div class="mm-dialog-text text-left">
版本号：${pkg.version}<br/>
1、 新增评论详情功能<br>
2、 新增title提示<br>
3、 新增歌曲缓冲进度<br>
4、 新增热门歌单<br>
5、 新增图片懒加载<br>
6、 修改热搜展示数据<br>
7、 优化已知问题
</div>`
            }
        },
        methods: {
            ...mapMutations({
                setAudioele: 'SET_AUDIOELE'
            }),
        }
    }
</script>

<style lang="less">
    @import "~assets/css/var";
    
    #app {
        position: relative;
        width: 100%;
        height: 100%;
        color: @text_color;
        font-size: @font_size_medium;
        .router-view {
            width: 100%;
            height: 100%;
        }
        audio{
            position: fixed;
        }
    }
</style>
