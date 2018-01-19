'use strict';

var express = require('express')
var Realm = require('realm')
var bodyParser = require('body-parser')
var sha256 = require('sha256')

var app = express();

var KEY_HASH = '830c772f2786883517c8ce55e2fbf1876d4f49ac8dfb4510221beb6a1c6b5a99'

app.use(bodyParser.urlencoded({extended: true}))

let PostSchema = {
  name: 'Post',
  primaryKey: 'timestamp',
  properties: {
    timestamp: 'int',
    title: 'string',
    content: 'string'
  }
}

var blogRealm = new Realm({
  path: 'blog.realm',
  schema: [PostSchema]
})

function getPostByTimestamp(timestamp){
  return blogRealm.objects('Post').filtered('timestamp = '+timestamp.toString())
}

app.post('/', function(req, res){
  let 
  title = req.body['title'],
  content = req.body['content'],
  timestamp = Date.now(),
  key = req.body['key']

  if(sha256(key) == KEY_HASH){
    blogRealm.write(() => {
      blogRealm.create('Post',{
        title: title,
        content: content,
        timestamp: timestamp
      })
    })
  }
  res.send(getPostByTimestamp(timestamp))
})

app.get('/', function(req, res){
  res.send(blogRealm.objects('Post').sorted('timestamp', true))
})

app.get('/:timestamp', function(req, res){
  let timestamp = req.params.timestamp
  res.send(getPostByTimestamp(timestamp))  
})

app.put('/:timestamp', function(req, res){
  let 
  title = req.body['title'],
  content = req.body['content'],
  timestamp = parseInt(req.params.timestamp),
  key = req.body['key']  

  if(getPostByTimestamp(timestamp) && sha256(key) == KEY_HASH){
    blogRealm.write(() => {
      blogRealm.create('Post',{
        title: title,
        content: content,
        timestamp: timestamp
      }, true)
    })
  }
  res.send(getPostByTimestamp(timestamp))  
})

app.delete('/:timestamp', function(req, res){
  let 
  timestamp = req.params.timestamp,
  post = getPostByTimestamp(timestamp),
  key = req.body['key']

  if(post && sha256(key) == KEY_HASH){
    blogRealm.write(() => {
      blogRealm.delete(post)
    })
  }
  res.send('')
})

app.listen(3000, function() {
  console.log("Blog server running...")
});