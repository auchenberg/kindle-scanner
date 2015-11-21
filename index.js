var express = require('express')
var app = express()
var amazon = require('amazon-product-api')
var browserify = require('browserify-middleware')

var client = amazon.createClient({
  awsTag: 'kennetauchen-20',
  awsId: 'AKIAJFWZ2Z63B2GJFHRQ',
  awsSecret: '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'
})

app.use(express.static('app'))
app.use('/scripts', browserify(__dirname + '/app'))
app.get('/isbn/:isbn', function (req, res) {
  client.itemLookup({
    idType: 'ISBN',
    itemId: req.params.isbn,
    responseGroup: 'ItemAttributes'
  }, function(err, results) {
    if (err) {
      res.json(err)
    } else {
      res.json(results)
    }
  })
})

var server = app.listen(3000, function () {
  console.log('Example app listening at http://%s:%s', server.address().address, server.address().port)
})