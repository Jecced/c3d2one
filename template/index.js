System.register(["./application.js"], function (_export, _context) {
  "use strict";

  var createApplication, canvas, $p, bcr;

  function loadJsListFile(url) {
    return new Promise(function (resolve, reject) {
      var err;

      function windowErrorListener(evt) {
        if (evt.filename === url) {
          err = evt.error;
        }
      }

      window.addEventListener('error', windowErrorListener);
      var script = document.createElement('script');
      script.charset = 'utf-8';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.addEventListener('error', function () {
        window.removeEventListener('error', windowErrorListener);
        reject(Error('Error loading ' + url));
      });
      script.addEventListener('load', function () {
        window.removeEventListener('error', windowErrorListener);
        document.head.removeChild(script); // Note that if an error occurs that isn't caught by this if statement,
        // that getRegister will return null and a "did not instantiate" error will be thrown.

        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
      script.src = url;
      document.head.appendChild(script);
    });
  }

  function loadAmmoJsWasmBinary() {
    return fetch('./cocos3d-js/ammo.wasm.wasm').then(function (response) {
      return response.arrayBuffer();
    });
  }

  function findCanvas() {
    // Use canvas in outer context
    if (!canvas || canvas.tagName !== 'CANVAS') {
      console.error("unknown canvas id:", el);
    }

    var width = canvas.width;
    var height = canvas.height;
    var container = document.createElement('div');

    if (canvas && canvas.parentNode) {
      canvas.parentNode.insertBefore(container, canvas);
    }

    container.setAttribute('id', 'Cocos3dGameContainer');
    container.appendChild(canvas);
    var frame = container.parentNode === document.body ? document.documentElement : container.parentNode;
    addClass(canvas, 'gameCanvas');
    canvas.setAttribute('width', width || '480');
    canvas.setAttribute('height', height || '320');
    canvas.setAttribute('tabindex', '99');
    return {
      frame: frame,
      canvas: canvas,
      container: container
    };
  }

  function addClass(element, name) {
    var hasClass = (' ' + element.className + ' ').indexOf(' ' + name + ' ') > -1;

    if (!hasClass) {
      if (element.className) {
        element.className += ' ';
      }

      element.className += name;
    }
  }

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

  return {
    setters: [function (_applicationJs) {
      createApplication = _applicationJs.createApplication;
    }],
    execute: function () {

      regLoading();

      canvas = document.getElementById('GameCanvas');
      $p = canvas.parentElement;
      bcr = $p.getBoundingClientRect();
      canvas.width = bcr.width;
      canvas.height = bcr.height;
      createApplication({
        loadJsListFile: loadJsListFile,
        loadAmmoJsWasmBinary: loadAmmoJsWasmBinary
      }).then(function (application) {
        return application.start({
          findCanvas: findCanvas
        });
      })["catch"](function (err) {
        console.error(err);
      });
    }
  };
});