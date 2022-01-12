const express = require('express')
const app = express()
const port = 3000

app.use(express.static('assets'))


app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
})

app.get('/main.js', (req, res) => {
  res.sendFile('main.js', { root: __dirname });
})

app.get('/main.css', (req, res) => {
  res.sendFile('main.css', { root: __dirname });
})

app.get('/graph.css', (req, res) => {
  res.sendFile('graph.css', { root: __dirname });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
