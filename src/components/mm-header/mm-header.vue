<template>
  <!--头部-->
  <header class="mm-header">
    <dl class="user">
      <template v-if="user.account">
        <router-link class="user-info" to="/music/userlist" tag="dt">
          <span>{{ user.account }}</span>
        </router-link>
        <dd class="user-btn" @click="openDialog(2)">退出</dd>
      </template>
      <dd v-else class="user-btn" @click="openDialog(0)">登录</dd>
    </dl>
    <!--登录-->
    <mm-dialog
      ref="loginDialog"
      head-text="登录"
      confirm-btn-text="登录"
      cancel-btn-text="关闭"
      @confirm="login"
    >
      <div class="mm-dialog-text">
        <input
          v-model.trim="username"
          class="mm-dialog-input"
          type="text"
          autofocus
          placeholder="输入群晖用户名"
        />
        <input
          v-model.trim="password"
          class="mm-dialog-input"
          type="password"
          autofocus
          placeholder="输入群晖密码"
          @keyup.enter="login"
        />
      </div>
    </mm-dialog>
    <!--帮助-->
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
import { getUserPlaylist, loginSYNO } from 'api'
import { mapGetters, mapActions } from 'vuex'
import MmDialog from 'base/mm-dialog/mm-dialog'
import { toHttps } from '@/utils/util'
import { getUserId } from '@/utils/storage'
export default {
  name: 'MmHeader',
  components: {
    MmDialog
  },
  data() {
    return {
      user: {}, // 用户数据
      username: '',
      password: ''
    }
  },
  computed: {
    ...mapGetters(['uid'])
  },
  created() {
    const id = getUserId()
    console.log(id)
    if (id != null && id != '' && id != undefined) {
      this.setUid(id)
      console.log(this.uid)
      if (this.uid) {
        this.user = { account: this.uid }
      }
    }
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
      }
    },
    // 退出登录
    out() {
      this.user = {}
      this.setUid(null)
      //清理cookie
      var keys = document.cookie.match(/[^ =;]+(?=\=)/g)
      if (keys) {
        for (var i = keys.length; i--; )
          document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
      }
      this.$mmToast('退出成功！')
    },
    // 登录
    login() {
      if (this.username === '') {
        this.$mmToast('用户名不能为空')
        this.openDialog(0)
        return
      }
      if (this.password === '') {
        this.$mmToast('密码不能为空')
        this.openDialog(0)
        return
      }
      loginSYNO(this.username, this.password).then((data) => {
        console.log(data)
        console.log('登录成功')
        this.setUid(data['data']['account'])
        this.user = data['data']
        setTimeout(() => {
          this.$mmToast(`${this.user.account} 欢迎使用 mmPlayer`)
        }, 200)
      })
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
    &-info {
      float: left;
      margin-right: 15px;
      cursor: pointer;
      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
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
  }
  a:hover {
    color: #d43c33;
  }
}
</style>
