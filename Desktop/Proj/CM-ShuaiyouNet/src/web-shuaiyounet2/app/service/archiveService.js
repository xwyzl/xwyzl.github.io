/**
 * Created by chenming on 15/10/19.
 */


var request = require("../util/request");
var signUrl = require("../util/signurl");
var config = require("../config");
var encryptUtils = require("../util/encryptUtils");
var path = require('path');


function ArchiveService(args){
    if(!(this instanceof ArchiveService)){
        return new ArchiveService(args);
    }
}

ArchiveService.prototype.getShareArchiveByPage = function* (pageIndex,pageSize){
    var params = {pageIndex:pageIndex,pageSize:pageSize};
    var url = signUrl("archiveService",params,"getShareArchiveByPage");
    var result = yield  request.transfer({uri:url,method:"GET",params:params});
    return result.body;
};

ArchiveService.prototype.getSharedShuaidang = function* (ano,key){
    var params = {archiveNo:ano,version:0,fromPinglunId:0};
    var url = signUrl("archiveService",params,"getSharedArchive");
    var result = yield  request.transfer({uri:url,method:"GET",params:params});
    return result.body;
};

ArchiveService.prototype.formatSharedShuaidangList = function(sharedShuaidangList){
    var ssdList = sharedShuaidangList;
    ssdList.forEach(function(ssd) {
        var shareKey = parseShareKey(ssd.sk);
        ssd.ctm_ = formatDate(ssd.ctm,"yyyy-MM-dd");
        ssd.aid  = shareKey.aid;
        ssd.ano = shareKey.ano;
        ssd.shareType = shareKey.shareType;
    });
    return ssdList;
};

ArchiveService.prototype.formatSharedShuaidang = function(sharedShuaidang){
    var ssd = sharedShuaidang;
    var sd = ssd.shuaidang;
    var shareType = parseShareKey(ssd.shareKey).shareType;
    ssd.isShareBaseinfo = Math.floor(shareType%2) >0 ? true:false;
    ssd.isShareImage = Math.floor((shareType/10)%2) >0 ? true:false;
    ssd.isShareVideo = Math.floor((shareType/100)%2) >0 ? true:false;
    ssd.isShareZhanji = Math.floor((shareType/1000)%2) >0 ? true:false;
    ssd.isShareGuancha = Math.floor((shareType/10000)%2) >0 ? true:false;
    if(ssd.fengmianPic){
        ssd.fengmianPic_ = getResourceURL(ssd.aid,ssd.fengmianPic);
    }
    sd.statusImage_ = "/images/ic_" + sd.status + ".png";
    if(ssd.isShareBaseinfo) {
        sd.baseinfo.shouTime_ = formatDate(sd.baseinfo.shouTime, "yyyy-MM-dd");
        sd.baseinfo.chandi_ = formatChandi(sd.baseinfo.chandi, sd.baseinfo.chandiDetail);
        sd.baseinfo.shouPrice_ = formatPrice(sd.baseinfo.shouPrice);
        sd.baseinfo.pinbie_ = formatPinbie(sd.baseinfo.pinbie);
        sd.baseinfo.pinzhong_ = formatPinzhong(sd.baseinfo.pinzhong);
        sd.baseinfo.pinlei_ = formatPinlei(sd.baseinfo.pinlei);
        sd.baseinfo.tag_ = formatTag(sd.baseinfo.tag1, sd.baseinfo.tag2, sd.baseinfo.tag3);
    }
    if(ssd.isShareImage){
        var imageList = [];
        sd.ziliaoList.forEach(function(zl) {
            if(zl.mediaType === "Pic"){
                zl.url = getResourceURL(ssd.aid,zl.localURI);
                imageList.push(zl);
            }
        })
        sd.imageList = imageList;
    }
    if(ssd.isShareVideo){
        var vodList = [];
        sd.ziliaoList.forEach(function(zl) {
            if(zl.mediaType === "Vod"){
                zl.url = getResourceURL(ssd.aid,zl.localURI);
                vodList.push(zl);
            }
        })
        sd.vodList = vodList;
    }

    return ssd;
};

var getResourceURL = function (aid,uri) {
    var url = config.resourceBasePath + formatAccountId(aid) + "/" + uri;
    return url;
}


var parseShareKey = function(key){
    try{
        var shareKey = encryptUtils.aesDecrypt(key, config.appinfo.appkey);
        var items = shareKey.split(path.sep);
        if (items.length != 3) {
            return;
        }
        var accountId = items[0];
        var archiveNo = items[1];
        var shareType = items[2];
    }catch(e){
        console.log(e)
    }
    return {
        aid:accountId,
        ano:archiveNo,
        shareType:shareType
    };
};

var formatAccountId = function(id) {
    var _id = id.toString();
    while (_id.length < 7) {
        _id = "0" + _id;
    }
    return _id;
}

var formatDate = function(timestamp,format){
    return new Date(timestamp).toLocaleString();
}

var formatChandi = function (chandi, chandiDetail) {
    if (chandiDetail)
        return getChandi(chandi) + "-" + chandiDetail;
    else
        return getChandi(chandi);
}

var getChandi  = function (chandi) {
    switch (chandi) {
        case 'Ningjin':
            return '宁津'
        case 'Ningyang':
            return '宁阳'
        case 'Henan':
            return '河南'
        case 'Hebei':
            return '河北'
        case 'Anhui':
            return '安徽'
        case 'Beijing':
            return '北京'
        case 'Shanghai':
            return '上海'
        case 'Shichang':
            return '市场'
        case 'Luguan':
            return '旅馆'
    }
}

var formatPrice = function (price) {
    if (price)
        return "¥" + price;
    else
        return "";
}

var formatPinbie = function (pinbie) {
    switch (pinbie) {
        case 'Qiu':
            return '秋虫'
        case 'Bai':
            return '白虫'
    }
}

var formatPinzhong = function (pinzhong) {
    switch (pinzhong) {
        case 'Qing':
            return '青'
        case 'Huang':
            return '黄'
        case 'Zi':
            return '紫'
        case 'Bai':
            return '白'
        case 'Hei':
            return '黑'
    }
}

var formatPinlei = function (pinlei) {
    switch (pinlei) {
        case 'Xishuai':
            return '蟋蟀'
        case 'Pizi':
            return '披子'
        case 'Dachi':
            return '大翅'
        case 'Lanyi':
            return '烂衣'
        case 'Dutui':
            return '独腿'
    }
}

var formatTag = function (tag1, tag2, tag3) {
    var tag = "";
    if (tag1)
        tag = tag1;
    if (tag2) {
        if (tag.length > 0)
            tag += ",";
        tag += tag2;
    }
    if (tag3) {
        if (tag.length > 0)
            tag += ";"
        tag += tag3;
    }
    return tag;
}


module.exports = ArchiveService;
