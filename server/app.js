const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const request = require('./util/request')
const package = require('./package.json')
const exec = require('child_process').exec
const cache = require('apicache').middleware
const ws = require('nodejs-websocket')
const uuid = require('uuid/v1')
const ArrayList = require('./util/ArrayList')
// 存放当前所有的客户端
const clients = new Map();
// 存放当前所有的房间
const rooms = new Map();
// 存放房间的当期那播放信息
const schedule = new Map();
// 存放当前的房主的conn
const owners = new Map();
// version check
exec('npm info NeteaseCloudMusicApi version', (err, stdout, stderr) => {
    if (!err) {
        let version = stdout.trim()
        if (package.version < version) {
            console.log(`最新版本: ${version}, 当前版本: ${package.version}, 请及时更新`)
        }
    }
})

const app = express()

// CORS
app.use((req, res, next) => {
    if (req.path !== '/' && !req.path.includes('.')) {
        res.header({
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': req.headers.origin || '*',
            'Access-Control-Allow-Headers': 'X-Requested-With',
            'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
            'Content-Type': 'application/json; charset=utf-8'
        })
    }
    next()
})

// cookie parser
app.use((req, res, next) => {
    req.cookies = {}, (req.headers.cookie || '').split(/\s*;\s*/).forEach(pair => {
        let crack = pair.indexOf('=')
        if (crack < 1 || crack == pair.length - 1) return
        req.cookies[decodeURIComponent(pair.slice(0, crack)).trim()] = decodeURIComponent(pair.slice(crack + 1)).trim()
    })
    next()
})

// body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// cache
app.use(cache('2 minutes', ((req, res) => res.statusCode === 200)))

// static
app.use(express.static(path.join(__dirname, 'public')))

app.get("/test", function (req, res) {
    // console.log(req)
    res.send("Hello world");
    var room = rooms.get("86dc9240-2aaa-11e9-b351-6f0e360379cd")
    console.log(room);
    console.log(room.size());
})

// router
const special = {
    'daily_signin.js': '/daily_signin',
    'fm_trash.js': '/fm_trash',
    'personal_fm.js': '/personal_fm'
}

fs.readdirSync(path.join(__dirname, 'module')).reverse().forEach(file => {
    if (!(/\.js$/i.test(file))) return
    let route = (file in special) ? special[file] : '/' + file.replace(/\.js$/i, '').replace(/_/g, '/')
    let question = require(path.join(__dirname, 'module', file))

    app.use(route, (req, res) => {
        let query = Object.assign({}, req.query, req.body, { cookie: req.cookies })
        question(query, request)
            .then(answer => {
                console.log('[OK]', decodeURIComponent(req.originalUrl))
                res.append('Set-Cookie', answer.cookie)
                if (decodeURIComponent(req.originalUrl).indexOf("/song/real/url") != -1 && answer.body.code == 200) {
                    // 说明请求成功,解析url的真实地址,并进行302跳转
                    res.redirect(answer.body.data[0].url);
                } else {
                    res.status(answer.status).send(answer.body)
                }
            })
            .catch(answer => {
                console.log('[ERR]', decodeURIComponent(req.originalUrl))
                if (answer.body.code == '301') answer.body.msg = '需要登录'
                res.append('Set-Cookie', answer.cookie)
                res.status(answer.status).send(answer.body)
            })
    })
})

//broadcast all msg
function broadcast(list, msg) {
    console.log("获取的列表" + list)
    console.log(list.size())
    if (list != null && list.size() > 0) {
        for (var i = 0; i < list.size(); i++) {
            list.get(i).sendText(msg);
        }
    }
}

function respond(conn,code){
    send = {
        "code": code
    };
    //返回消息告诉房主
    conn.sendText(JSON.stringify(send));
}


//create websocket listening server
var server = ws.createServer(function (conn) {
    conn.on("text", function (str) {
        // var getJson = eval('(' + str + ')');
        var getJson = JSON.parse(str)
        //获取用户的id
        var id = getJson.id;
        console.log("请求的用户id:"+id)
        //获取当前的状态值
        var code = getJson.code;
        console.log("状态值:" + code)
        if (code == 100) {
            //代表使用当前的房主建立房间
            if (id != null && id != undefined && id != "") {
                //如果id不为空的话,那么就把从owners中获取是否已经有相同id的房间开房了
                var owner = owners.get(id)
                if (owner == null || owner==undefined) {
                    //如果没有开过房间,那么就把当前的链接放入到map中
                    owners.set(id, conn);
                    respond(conn,200)
                } else {
                    //说明已经开过房间.
                    respond(conn,400)
                }
            }
        } else if (code == 200) {
            //代表客户端加入
            if (id != null && id != undefined && id != "") {

                var owner = owners.get(parseInt(id))
                if (owner == null || owner == undefined) {
                    //说明没有房间.返回没有房间
                    respond(conn,500)
                } else {
                    //说明有房间了
                    var room = rooms.get(id+"room")
                    //判断是否已经开启了房间
                    if (room == null || room == undefined) {
                        //说明还没有用户房间,那么就创建一个room
                        console.log(id+"目前还没有房间,准备创建")
                        var list = new ArrayList.ArrayList();
                        list.add(conn);
                        rooms.set(id+"room", list);
                        console.log(rooms)
                        //200 表示一切正常
                    } else {
                        console.log("房间存在,添加新连接")
                        room.add(conn)
                        rooms.set(id+"room", room);
                    }
                    respond(conn,200)
                }
            }
        } else if (code == 600) {
            //表示传送房主当前的播放信息
            console.log("房主传送消息"+id)
            // console.log(str)
            if (id != null && id != undefined && id != "") {
                var room = rooms.get(id+"room");
                if (room != null && room!=undefined) {
                    //如果房间不为空的话,把房主发的数据转发到客户端中.
                    broadcast(room, str)
                }
            }
        }
    })
    conn.on("close", function (code, reason) {
        var id = parseInt(conn.path.slice(1))
        var owner = owners.get(id);
        if (owner != null && owner!=undefined) {
            //说明是房主要关闭了.
            owners.delete(id)
            rooms.delete(id)
        }
    });
    conn.on("error", function (code, reason) {
        var id = parseInt(conn.path.slice(1))
        var owner = owners.get(id);
        if (owner != null && owner!=undefined) {
            //说明是房主要关闭了.
            owners.delete(id)
            rooms.delete(id)
        }
    });
}).listen(12345)



const port = process.env.PORT || 3000

app.server = app.listen(port, () => {
    console.log(`server running @ http://localhost:${port}`)
})

module.exports = app
