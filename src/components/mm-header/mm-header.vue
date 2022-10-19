<template>
  <!--头部-->
  <header class="mm-header">
    <h1 class="header">
      <a href="https://github.com/maomao1996/Vue-mmPlayer" target="_blank">
        mmPlayer 在线音乐播放器
      </a>
    </h1>
    <dl class="user">
      <template v-if="user.userId">
        <router-link class="user-info" to="/music/userlist" tag="dt">
          <img class="avatar" :src="`${user.avatarUrl}?param=50y50`" />
          <span>{{ user.nickname }}</span>
        </router-link>
        <dd class="user-btn" @click="openDialog(2)">退出</dd>
      </template>
      <template v-else>
        <dd class="user-btn uid-btn" @click="openDialog(0)">UID登录</dd>
        <dd class="user-btn" @click="openDialog(4)">账号密码登录</dd>
      </template>
    </dl>
    <!--UID 登录-->
    <mm-dialog
      ref="loginDialog"
      head-text="UID登录"
      confirm-btn-text="登录"
      cancel-btn-text="关闭"
      @confirm="login"
    >
      <div class="mm-dialog-text">
        <input
          v-model.trim="uidValue"
          class="mm-dialog-input"
          type="number"
          autofocus
          placeholder="请输入您的网易云 UID"
          @keyup.enter="login"
        />
      </div>
      <div slot="btn" @click="openDialog(1)">帮助</div>
    </mm-dialog>
    <!--账号密码 登录-->
    <mm-dialog
      ref="accountLoginDialog"
      head-text="账号登录"
      confirm-btn-text="登录"
      cancel-btn-text="关闭"
      @confirm="accountLogin"
    >
      <div class="mm-dialog-text">
        <input
          v-model.trim="userInfo.account"
          class="mm-dialog-input account-input"
          type="text"
          autofocus
          placeholder="请输入您的网易云 账号(手机号或邮箱)"
        />
        <input
          v-model.trim="userInfo.password"
          class="mm-dialog-input"
          type="text"
          autofocus
          placeholder="请输入您的网易云 密码"
          @keyup.enter="accountLogin"
        />
      </div>
    </mm-dialog>
    <!--uid登录帮助-->
    <mm-dialog
      ref="helpDialog"
      head-text="登录帮助"
      confirm-btn-text="去登录"
      cancel-btn-text="关闭"
      @confirm="openDialog(0)"
    >
      <div class="mm-dialog-text">
        <p>
          1、
          <a target="_blank" href="https://music.163.com">
            点我(https://music.163.com)
          </a>
          打开网易云音乐官网
        </p>
        <p>2、点击页面右上角的“登录”</p>
        <p>3、点击您的头像，进入我的主页</p>
        <p>4、复制浏览器地址栏 /user/home?id= 后面的数字（网易云 UID）</p>
      </div>
    </mm-dialog>
    <!--退出-->
    <mm-dialog
      ref="outDialog"
      body-text="确定退出当前用户吗？"
      @confirm="out"
    />
  </header>
</template>

<script>
import { getUserPlaylist, phoneLogin, emailLogin, logout } from 'api'
import { mapGetters, mapActions } from 'vuex'
import MmDialog from 'base/mm-dialog/mm-dialog'
import { toHttps, isPhone, isEmail } from '@/utils/util'

export default {
  name: 'MmHeader',
  components: {
    MmDialog
  },
  data() {
    return {
      user: {}, // 用户数据
      uidValue: '', // 记录用户 UID
      userInfo: {
        account: '',
        password: ''
      }
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
          this.$refs.loginDialog.show()
          break
        case 1:
          this.$refs.loginDialog.hide()
          this.$refs.helpDialog.show()
          break
        case 2:
          this.$refs.outDialog.show()
          break
        case 3:
          this.$refs.loginDialog.hide()
          break
        case 4:
          this.$refs.accountLoginDialog.show()
          break
      }
    },
    // 退出登录
    out() {
      this.user = {}
      this.setUid(null)
      localStorage.removeItem('cookie')
      logout()
      this.$mmToast('退出成功！')
    },
    // 登录
    login() {
      if (this.uidValue === '') {
        this.$mmToast('UID 不能为空')
        this.openDialog(0)
        return
      }
      this.openDialog(3)
      this._getUserPlaylist(this.uidValue)
    },
    // 账号密码登录
    accountLogin() {
      const { account, password } = this.userInfo
      if (account === '') {
        this.$mmToast('账号 不能为空')
        this.openDialog(4)
        return
      }
      if (password === '') {
        this.$mmToast('密码 不能为空')
        this.openDialog(4)
        return
      }
      if (isPhone(account)) {
        phoneLogin({ phone: account, password })
          .then(({ account, cookie }) => {
            localStorage.setItem('cookie', cookie)
            this._getUserPlaylist(account.id)
          })
        return
      }
      if (isEmail(account)) {
        emailLogin({ email: account, password })
          .then(({ account, cookie }) => {
            localStorage.setItem('cookie', cookie)
            this._getUserPlaylist(account.id)
          })
        return
      }
      this.$mmToast('手机号或邮箱格式有误')
      this.openDialog(4)
    },
    // 获取用户数据
    _getUserPlaylist(uid) {
      getUserPlaylist(uid).then(({ playlist = [] }) => {
        this.uidValue = ''
        if (playlist.length === 0 || !playlist[0].creator) {
          this.$mmToast(`未查询找 UID 为 ${uid} 的用户信息`)
          return
        }
        const creator = playlist[0].creator
        this.setUid(uid)
        creator.avatarUrl = toHttps(creator.avatarUrl)
        this.user = creator
        setTimeout(() => {
          this.$mmToast(`${this.user.nickname} 欢迎使用 mmPlayer`)
        }, 200)
      })
    },
    ...mapActions(['setUid'])
  }
}
</script>

<style lang="less">
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
      padding-left: 15px;
      text-align: left;
    }
  }
  .user {
    position: absolute;
    top: 50%;
    right: 15px;
    line-height: 30px;
    text-align: right;
    transform: translateY(-50%);
    .uid-btn {
      margin-right: 15px;
    }
    &-info {
      float: left;
      margin-right: 15px;
      cursor: pointer;
      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 90px;
        vertical-align: middle;
      }
      span {
        margin-left: 10px;
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
    &.account-input {
      margin-bottom: 10px;
    }
  }
  a:hover {
    color: #d43c33;
  }
}
</style>
