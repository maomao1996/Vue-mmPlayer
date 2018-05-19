<template>
    <!--头部-->
    <header class="mm-header">
        <h1 class="header">mmPlayer在线音乐播放器</h1>
        <dl class="user">
            <template v-if="user.userId">
                <router-link class="user-info" to="/music/userlist" tag="dt">
                    <img :src="`${user.avatarUrl}?param=50y50`">
                    <span>{{user.nickname}}</span>
                </router-link>
                <dd class="user-btn" @click="openDialog(2)">退出</dd>
            </template>
            <dd v-else class="user-btn" @click="openDialog(0)">登录</dd>
        </dl>
        <!--登录-->
        <mm-dialog ref="loginDialog" headText="登录" confirmBtnText="登录" cancelBtnText="关闭" @confirm="login">
            <div class="mm-dialog-text">
                <input class="mm-dialog-input" type="number" autofocus placeholder="请输入您的网易云UID"
                       v-model.trim="uidValue">
            </div>
            <div slot="btn" @click="openDialog(1)">帮助</div>
        </mm-dialog>
        <!--帮助-->
        <mm-dialog ref="helpDialog" headText="登录帮助" confirmBtnText="去登录" cancelBtnText="关闭" @confirm="openDialog(0)">
            <div class="mm-dialog-text">
                <p>1、<a target="_blank" href="http://music.163.com">点我(http://music.163.com)</a>打开网易云音乐官网</p>
                <p>2、点击页面右上角的“登录”</p>
                <p>3、点击您的头像，进入我的主页</p>
                <p>4、复制浏览器地址栏 /user/home?id= 后面的数字（网易云 UID）</p>
            </div>
        </mm-dialog>
        <!--退出-->
        <mm-dialog ref="outDialog" @confirm="out" bodyText="确定退出当前用户吗？"/>
    </header>
</template>

<script>
    import {getUserPlaylist} from 'api'
    import {mapGetters, mapActions} from 'vuex'
    import MmDialog from 'base/mm-dialog/mm-dialog'
    
    export default {
        name: "mm-header",
        components: {
            MmDialog
        },
        data() {
            return {
                user: {}, // 用户数据
                uidValue: '', // 记录用户 UID
            }
        },
        computed: {
            ...mapGetters(['uid'])
        },
        created() {
            this.uid && this._getUserPlaylist(this.uid)
        },
        methods: {
            // 打开对话框
            openDialog(key) {
                switch (key) {
                    case 0:
                        this.$refs.loginDialog.show();
                        break;
                    case 1:
                        this.$refs.loginDialog.hide();
                        this.$refs.helpDialog.show();
                        break;
                    case 2:
                        this.$refs.outDialog.show();
                        break
                }
            },
            // 退出登录
            out() {
                this.user = {};
                this.setUid(null);
                this.$mmToast('退出成功！')
            },
            // 登录
            login() {
                if (this.uidValue === '') {
                    this.$mmToast('UID不能为空');
                    this.openDialog(0)
                }
                this._getUserPlaylist(this.uidValue)
            },
            // 获取用户数据
            _getUserPlaylist(uid) {
                getUserPlaylist(uid)
                    .then(res => {
                        if (res.data.code === 200) {
                            this.uidValue = '';
                            if (res.data.playlist.length === 0 || !res.data.playlist[0].creator) {
                                this.$mmToast(`未查询找UID为 ${uid} 的用户信息`);
                                return
                            }
                            this.setUid(uid);
                            this.user = res.data.playlist[0].creator;
                            setTimeout(() => {
                                this.$mmToast(`${this.user.nickname} 欢迎使用`)
                            }, 200)
                        }
                    })
            },
            ...mapActions(['setUid'])
        },
    }
</script>

<style lang="less">
    @import "~assets/css/var";
    
    .mm-header {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 60px;
        @media (max-width: 768px) {
            background: @header_bg_color;
        }
        .header {
            text-align: center;
            line-height: 60px;
            color: @text_color_active;
            font-size: @font_size_large;
            @media (max-width: 768px) {
                padding-left: 20px;
                text-align: left;
            }
        }
        .user {
            position: absolute;
            top: 50%;
            right: 20px;
            line-height: 30px;
            text-align: right;
            transform: translateY(-50%);
            &-info {
                float: left;
                margin-right: 15px;
                cursor: pointer;
                img {
                    width: 30px;
                    height: 30px;
                    border-radius: 90px;
                    vertical-align: middle;
                }
                span {
                    color: @text_color_active;
                }
            }
            &-btn {
                float: left;
                cursor: pointer;
                &:hover {
                    color: @text_color_active;
                }
            }
            @media (max-width: 768px) {
                &-info {
                    margin-right: 10px;
                    span {
                        display: none;
                    }
                }
            }
        }
        .mm-dialog-text {
            text-align: left;
            .mm-dialog-input {
                width: 100%;
                height: 40px;
                box-sizing: border-box;
                padding: 0 15px;
                border: 1px solid @btn_color;
                outline: 0;
                background: transparent;
                color: @text_color_active;
                font-size: @font_size_medium;
                box-shadow: 0 0 1px 0 #fff inset;
                &::placeholder {
                    color: @text_color;
                }
            }
            a:hover {
                color: #d43c33;
            }
        }
    }
</style>
