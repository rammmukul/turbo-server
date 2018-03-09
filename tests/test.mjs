import fetch from 'node-fetch'
import test from 'tape'
import App from '../lib/server'

// Start App Server
const app = new App()
app.listen() // process.env.PORT || 5000

test('responds to requests', async (t) => {
  t.plan(9)
  let res, text, error
  try {
    res = await fetch('http://127.0.0.1:5000/aa')
    text = await res.text()
  } catch (e) {
    error = e
  }
  t.false(error)
  t.equal(res.status, 404)
  t.equal(text, 'Not Found')
  try {
    res = await fetch('http://127.0.0.1:5000')
    text = await res.text()
  } catch (e) {
    error = e
  }
  t.false(error)
  t.equal(res.status, 200)
  t.equal(text, '<h1>hello world</h1>\n')
  try {
    res = await fetch('http://127.0.0.1:5000', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({hello: 'world'})
    })
    text = await res.text()
  } catch (e) {
    error = e
  }
  t.false(error)
  t.equal(res.status, 200)
  t.equal(text, '<h1>hello world</h1>\n')
  // Shutdown App Server
  app.close()
})
