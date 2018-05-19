<template>
    <!--对话框-->
    <transition name="mm-dialog-fade">
        <div class="mm-dialog-box" v-show="dialogShow">
            <div class="mm-dialog-wrapper">
                <div class="mm-dialog-content">
                    <div class="mm-dialog-head" v-text="headText"></div>
                    <slot>
                        <div class="mm-dialog-text" v-html="bodyText"></div>
                    </slot>
                    <div class="mm-dialog-btns">
                        <div class="mm-btn-cancel" v-if="dialogType!==1" v-text="cancelBtnText" @click="cancel"></div>
                        <slot name="btn"></slot>
                        <div class="mm-btn-confirm" v-text="confirmBtnText" @click="confirm"></div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        name: "mm-dialog",
        props: {
            /**
             * type 0：Confirm（默认）
             *      1：Alert
             */
            dialogType: {
                type: Number,
                default: 0
            },
            // 标题文本
            headText: {
                type: String,
                default: '提示'
            },
            // 内容文本（可以是html）
            bodyText: {
                type: String,
                default: ''
            },
            // 取消按钮文本
            cancelBtnText: {
                type: String,
                default: '取消'
            },
            // 确定按钮文本
            confirmBtnText: {
                type: String,
                default: '确定'
            }
        },
        data(){
            return {
                dialogShow: false //是否显示对话框
            }
        },
        methods: {
            // 显示事件
            show() {
                this.dialogShow = true;
            },
            // 隐藏事件
            hide() {
                this.dialogShow = false;
            },
            // 取消事件
            cancel() {
                this.hide();
                this.$emit('cancel')
            },
            // 确定事件
            confirm() {
                this.hide();
                this.$emit('confirm')
            }
        }
    }
</script>

<style lang="less">
    @import "~assets/css/var";
    
    .mm-dialog-box {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 1996;
        background-color: @dialog_bg_color;
        user-select: none;
        &.mm-dialog-fade-enter-active {
            animation: mm-dialog-fadein 0.3s;
            .mm-dialog-content {
                animation: mm-dialog-zoom 0.3s;
            }
        }
        .mm-dialog-wrapper {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1996;
            .mm-dialog-content {
                width: 420px;
                border-radius: 5px;
                background: @dialog_content_bg_color;
                @media (max-width: 767px) {
                    width: 270px;
                    border-radius: 10px;
                    text-align: center;
                }
                .mm-dialog-head {
                    padding: 15px;
                    padding-bottom: 0;
                    font-size: @font_size_large;
                    color: @text_color_active;
                }
                .mm-dialog-text {
                    padding: 20px 15px;
                    line-height: 22px;
                    font-size: @font_size_medium;
                    color: @dialog_text_color;
                }
                .mm-dialog-btns {
                    display: flex;
                    align-items: center;
                    padding: 0 15px 10px;
                    text-align: center;
                    color: @dialog_text_color;
                    @media (min-width: 768px) {
                        justify-content: flex-end;
                        div {
                            display: block;
                            padding: 8px 15px;
                            border-radius: 3px;
                            border: 1px solid @btn_color;
                            font-size: @font_size_medium;
                            cursor: pointer;
                            &:not(:nth-of-type(1)) {
                                margin-left: 10px;
                            }
                            &.mm-btn-confirm {
                                border-style: @btn_color_active;
                            }
                            &:hover {
                                color: @text_color_active;
                                border: 1px solid @btn_color_active;
                            }
                        }
                    }
                    @media (max-width: 767px) {
                        & {
                            padding: 0;
                            justify-content: center;
                            div {
                                flex: 1;
                                line-height: 22px;
                                padding: 10px 0;
                                border-top: 1px solid @dialog_line_color;
                                font-size: @font_size_large;
                                &:not(:nth-of-type(1)) {
                                    border-left: 1px solid @dialog_line_color;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    @keyframes mm-dialog-fadein {
        0% {
            opacity: 0
        }
        100% {
            opacity: 1
        }
    }
    
    @keyframes mm-dialog-zoom {
        0% {
            transform: scale(0)
        }
        50% {
            transform: scale(1.1)
        }
        100% {
            transform: scale(1)
        }
    }
</style>
