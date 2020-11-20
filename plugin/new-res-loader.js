// 新的资源载入方式脚本

/** 官网范例,反正看不懂
 * - https://developer.mozilla.org/zh-CN/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_1_%E2%80%93_JavaScript's_UTF-16_%3E_base64
 */
function b64ToUint6(nChr) {
    return nChr > 64 && nChr < 91
        ? nChr - 65 : nChr > 96 && nChr < 123
            ? nChr - 71 : nChr > 47 && nChr < 58
                ? nChr + 4 : nChr === 43
                    ? 62 : nChr === 47
                        ? 63 : 0
}

/** 官网范例+1,看不懂+1,作用是将base64编码的字符串转为ArrayBuffer */
function base64DecToArr(sBase64, nBlockSize) {
    var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length
    var nOutLen = nBlockSize ? Math.ceil((nInLen * 3 + 1 >>> 2) / nBlockSize) * nBlockSize : nInLen * 3 + 1 >>> 2
    var aBytes = new Uint8Array(nOutLen)
    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
        nMod4 = nInIdx & 3
        nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4
        if (nMod4 === 3 || nInLen - nInIdx === 1) {
            for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++ , nOutIdx++) {
                aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
            }
            nUint24 = 0
        }
    }
    return aBytes
}
function uint6ToB64 (nUint6) {

    return nUint6 < 26 ?
        nUint6 + 65
        : nUint6 < 52 ?
            nUint6 + 71
            : nUint6 < 62 ?
                nUint6 - 4
                : nUint6 === 62 ?
                    43
                    : nUint6 === 63 ?
                        47
                        :
                        65;

}

function base64EncArr (arraybuffer) {

    let aBytes = new Uint8Array(arraybuffer.buffer)

    var eqLen = (3 - (aBytes.length % 3)) % 3, sB64Enc = "";

    for (var nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
        nMod3 = nIdx % 3;
        /* Uncomment the following line in order to split the output in lines 76-character long: */
        /*
        if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
        */
        nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
        if (nMod3 === 2 || aBytes.length - nIdx === 1) {
            sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
            nUint24 = 0;
        }
    }

    return  eqLen === 0 ?
        sB64Enc
        :
        sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");

}

function regLoading(){
    let ccc = System["import"]('cc')
    ccc.then(function(engine) {
        engine.loader.addDownloadHandlers({
            json: function (item, callback) {
                if (item.url.startsWith("./")) {
                    item.url = item.url.substring(2)
                }
                callback(null, JSON.stringify(window.res[item.url]))
            },
            bin: function (item, callback) {
                var arr = base64DecToArr(window.res[item.url])
                callback(null, arr)
            },
            plist: function (item, callback) {
                callback(null, window.res[item.url])
            },
            png: function (item, callback) {
                var img = new Image()
                img.src = "data:image/png;base64," + window.res[item.url]   // 注意需要给base64编码添加前缀
                img.onload = function (){
                    callback(null, img)
                }
            },
            jpg: function (item, callback) {
                var img = new Image()
                img.src = "data:image/jpeg;base64," + window.res[item.url]
                img.onload = function (){
                    callback(null, img)
                }
            },
            webp: function (item, callback) {
                var img = new Image()
                img.src = "data:image/webp;base64," + window.res[item.url]
                img.onload = function (){
                    callback(null, img)
                }
            },
            mp3: function (item, callback) {
                // 只支持以webAudio形式播放的声音
                // 将base64编码的声音文件转化为ArrayBuffer
                cc.sys.__audioSupport.context.decodeAudioData(
                    base64DecToArr(window.res[item.url]).buffer,
                    // success
                    function (buffer) {
                        callback(null, buffer)
                    },
                    // fail
                    function (buffer) {
                        callback(new Error("mp3-res-fail"), null)
                    }
                )
            },
        })
    })
}