// hack for global nextTick

function noop() {

}

window.MessageChannel = noop
window.setImmediate = noop



// WEBPACK FOOTER //
// ./src/common/js/hack.js