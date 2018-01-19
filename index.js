'use strict';

var express = require('express')
var Realm = require('realm')
var bodyParser = require('body-parser')

var app = express();

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
  timestamp = Date.now()

  blogRealm.write(() => {
    blogRealm.create('Post',{
      title: title,
      content: content,
      timestamp: timestamp
    })
  })
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
  timestamp = parseInt(req.params.timestamp)

  if(getPostByTimestamp(timestamp)){
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
  post = getPostByTimestamp(timestamp)

  if(post){
    blogRealm.write(() => {
      blogRealm.delete(post)
    })
  }
  res.send('')
})

app.listen(3000, function() {
  console.log("Blog server running...")
});