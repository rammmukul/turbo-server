import turbo from 'turbo-http'
import requestPatches from './request-patches'
import bodyParser from './body-parser'
import staticHandler from './static-handler'

const addHandler = (handler, parent = rootHandler) => {
  if (parent.next) {
    addHandler(handler, parent.next)
  } else {
    parent.next = handler
  }
}

const rootHandler = bodyParser
addHandler(staticHandler)

export default class App {
  constructor () {
    this.server = turbo.createServer(function (req, res) {
      req.res = res
      req._next = rootHandler
      Object.assign(req, requestPatches)
    })
  }
  listen (port) {
    this.server.listen(process.env.PORT || port || 5000)
    console.log('Server running on PORT' + port)
  }
  close () {
    this.server.close(_ => {
      console.log('Shutting down App!')
      process.exit()
    })
  }
}
