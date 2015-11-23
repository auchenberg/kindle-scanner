var express = require('express')
var app = express()
var amazon = require('amazon-product-api')
var browserify = require('browserify-middleware')

var client = amazon.createClient({
  awsTag: process.env.awsTag,
  awsId: process.env.awsId,
  awsSecret: process.env.awsSecret
})

app.set('port', (process.env.PORT || 3000));

app.use(express.static('app'))
app.use('/scripts', browserify(__dirname + '/app'))
app.get('/api/isbn/:isbn', function (req, res) {
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

var server = app.listen(app.get('port'), function () {
  console.log('Example app listening at http://%s:%s', server.address().address, server.address().port)
})