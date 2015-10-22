/**
 * Created by chenming on 15/10/19.
 */

var router = require("koa-router")(),
    archiveService = require("../service/archiveService")(),
    log = require("../log/boleLog").boleLog,
    querystring = require("querystring"),
    config = require("../config");


router.get("/archive/:ano",function* (next){

    var query = querystring.parse(this.req.url);
    var response = yield archiveService.getSharedShuaidang(this.params.ano,query.key);
    var ssd = archiveService.formatSharedShuaidang(response.sharedShuaidang);

    var model = {
        "title" : "档案",
        "ssd" :ssd
    };

    this.render("archive/archive",model);


});

module.exports = router;
