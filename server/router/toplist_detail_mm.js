// 排行榜详情
const express = require("express");
const router = express();
const { createWebAPIRequest } = require("../util/util");

router.get("/", (req, res) => {
    const cookie = req.get("Cookie") ? req.get("Cookie") : "";
    const action = "/weapi/v3/playlist/detail";
    const data = {
        id: req.query.id,
        limit: req.query.limit || 30,
        offset: req.query.limit || 0,
        total: true,
        n: 1000,
        csrf_token: ""
    };
    createWebAPIRequest(
        "music.163.com",
        action,
        "POST",
        data,
        cookie,
        music_req => {
            res.setHeader("Content-Type", "application/json");
            res.send(music_req);
        },
        err => res.status(502).send("fetch error")
    );
});

module.exports = router;
