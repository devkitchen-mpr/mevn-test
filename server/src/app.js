//constants
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')

//variables
var Post = require('./models/post')
const { rawListeners } = require('./models/post')

//create server
const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

//create db connection
mongoose.connect('mongodb://localhost:27017/posts'
  , { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    }
  )
var db = mongoose.connection

db.on("error", console.error.bind("[ERROR] DB Connection failed"))
db.once("open", (callback) => {
  console.log("[INFO] DB Connection established")
})

//get post
app.get('/posts', (req, res) => {
  Post.find({}, 'title description', (error, posts) => {
    if (error) {
      console.error('[ERROR] could not GET Post')
    }

    res.send({
      posts: posts
    })
  }).sort({id:-1})
})

// Add new post
app.post('/posts', (req, res) => {

  let db = req.db
  let title = req.body.title
  let description = req.body.description
  let new_post = new Post({
    title: title,
    description: description
  })

  new_post.save(function (error) {
    if (error) {
      console.log(error)
    }

    res.send({
      success: true,
      message: 'Post saved successfully!'
    })
  })
})

//fetch single post
app.get('/posts/:id', (req, res) => {
  console.log('[INFO] get post')
  let db = req.db
  Post.findById(req.params.id, 'title description', (error, post) => {
    if (error) {
      console.error('[ERROR] could not find post: ' + error)
    }
    res.send(post)
  })
})

//update a post
app.put('/posts/:id', (req, res) => {
  let db = req.db
  Post.findById(req.params.id, 'title description', (error, post) => {
    if (error) {
      console.error('[ERROR] could not find post: ' + error)
    }
    
    post.title = req.body.title
    post.description = req.body.description
    post.save((error) => {
      if (error) {
        console.error('[ERROR] could not save post: ' + error)
      }
      
      res.send({
        success: true
      })
    })
  })
})

//delete a post
app.delete('/posts/:id', (req, res) => {
  console.log('[INFO] delete post: ' + req.params.id)
  console.log(req)
  let db = req.db
  Post.remove({
    _id: req.params.id
  }), (error, post) => {
    console.log('[INFO] delete post:')
    console.log(post)
    if (err) {
      console.log(err)
      res.send(err)
    }
    console.log('[INFO] delete post success')
    res.send({
      success: true
    })
  }
})

app.listen(process.env.PORT || 8081)