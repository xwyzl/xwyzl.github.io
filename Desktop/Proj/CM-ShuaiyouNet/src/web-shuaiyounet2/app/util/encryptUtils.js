var crypto = require('crypto');

/**
 * aes加密
 * @param data
 * @param secretKey
 */
function aesEncrypt(data, secretKey) {
    var cipher = crypto.createCipher('aes-128-ecb',secretKey);
    return cipher.update(data,'utf8','hex') + cipher.final('hex');
}

/**
 * aes解密
 * @param data
 * @param secretKey
 * @returns {*}
 */
function aesDecrypt(data, secretKey) {
    var cipher = crypto.createDecipher('aes-128-ecb',secretKey);
    return cipher.update(data,'hex','utf8') + cipher.final('utf8');
}


module.exports.aesEncrypt= aesEncrypt;
module.exports.aesDecrypt= aesDecrypt;