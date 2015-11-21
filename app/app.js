var $ = require('jquery')
var Quagga = require('quagga')

function lookupUPC(code) {
  return window.fetch(`/api/isbn/${code}`).then(function(response) {
    return response.json()
  }).then(function(data){
      return data
  }).catch(function(err) {
    console.log(err)
  })   
}

$(function() {

    var App = {
      init : function() {
        var self = this;
        Quagga.init(this.state, function(err) {
          if (err) {
            return self.handleError(err);
          }
          Quagga.start();
        });
      },
      handleError: function(err) {
        console.log(err);
      },

      state: {
        inputStream: {
          type : "LiveStream",
          constraints: {
            width: 640,
            height: 480,
            facing: "environment" // or user
          },
          area: { 
            top: "0%",    
            right: "0%",  
            left: "0%",   
            bottom: "60%"  
          },          
          singleChannel: true
        },
        locator: {
          patchSize: "medium"
        },
        numOfWorkers: 8,
        decoder: {
          readers : [ "ean_reader"]
        },
        locate: true
      },
      lastResult : null
    };

    App.init();

    Quagga.onProcessed(function(result) {
      var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
          if (result.boxes) {
            drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
            result.boxes.filter(function (box) {
              return box !== result.box;
            }).forEach(function (box) {
              Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
            });
          }

          if (result.box) {
            Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
          }

          if (result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
          }
        }
    });

    Quagga.onDetected(function(result) {
      var code = result.codeResult.code;

      if (App.lastResult !== code) {
        App.lastResult = code;

        setTimeout(function() {
          App.lastResult = null
        }, 10000)

        lookupUPC(code).then(function(data) {

          var kindle= data.filter(function(item) {
            if(item['ItemAttributes'][0]['Format']) {
              return item['ItemAttributes'][0]['Format'][0] === 'Kindle eBook'
            } else {
              return false
            }
          })

          if(kindle) {
            var ASIN = kindle[0]['ASIN'][0]
            var url = `http://www.amazon.com/gp/aw/d/${ASIN}? ref=tmm_kin_title_0?ie=UTF8&qid=&sr=`
            window.open(url)
          }
        })
      }
    })
});