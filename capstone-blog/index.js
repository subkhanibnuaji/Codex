const path = require('path');
const express = require('express');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

let posts = [];
let nextId = 1;

const findPost = (id) => posts.find((post) => post.id === id);

app.get('/', (req, res) => {
  const sortedPosts = [...posts].sort((a, b) => b.createdAt - a.createdAt);
  res.render('index', {
    pageTitle: 'My Blog',
    posts: sortedPosts,
    error: null,
    formData: {}
  });
});

app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  const trimmedTitle = title ? title.trim() : '';
  const trimmedContent = content ? content.trim() : '';

  if (!trimmedTitle || !trimmedContent) {
    const sortedPosts = [...posts].sort((a, b) => b.createdAt - a.createdAt);
    return res.status(400).render('index', {
      pageTitle: 'My Blog',
      posts: sortedPosts,
      error: 'Title and content are required.',
      formData: { title, content }
    });
  }

  const timestamp = new Date();
  const newPost = {
    id: nextId++,
    title: trimmedTitle,
    content: trimmedContent,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  posts.push(newPost);

  res.redirect(`/posts/${newPost.id}`);
});

app.get('/posts/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const post = findPost(id);

  if (!post) {
    return next();
  }

  res.render('post', {
    pageTitle: post.title,
    post
  });
});

app.get('/posts/:id/edit', (req, res, next) => {
  const id = Number(req.params.id);
  const post = findPost(id);

  if (!post) {
    return next();
  }

  res.render('edit', {
    pageTitle: `Edit ${post.title}`,
    post,
    error: null
  });
});

app.put('/posts/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const post = findPost(id);

  if (!post) {
    return next();
  }

  const { title, content } = req.body;
  const trimmedTitle = title ? title.trim() : '';
  const trimmedContent = content ? content.trim() : '';

  if (!trimmedTitle || !trimmedContent) {
    return res.status(400).render('edit', {
      pageTitle: `Edit ${post.title}`,
      post: { ...post, title, content },
      error: 'Title and content are required.'
    });
  }

  post.title = trimmedTitle;
  post.content = trimmedContent;
  post.updatedAt = new Date();

  res.redirect(`/posts/${post.id}`);
});

app.delete('/posts/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const postIndex = posts.findIndex((p) => p.id === id);

  if (postIndex === -1) {
    return next();
  }

  posts.splice(postIndex, 1);
  res.redirect('/');
});

app.use((req, res) => {
  res.status(404).render('404', {
    pageTitle: 'Not Found',
    message: 'The page you are looking for does not exist.'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
