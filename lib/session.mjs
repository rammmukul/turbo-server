import uid from 'uid-safe'
import MemoryStore from './memory-store'
import RedisStore from './redis-store'

let options = {
  database: RedisStore,
  expire: 60 * 60 * 1 // 1 hr
}
let DB = options.database || MemoryStore
let sessionStore = new DB(options)

class Session {
  async init (req, res) {
    let data
    if (req.cookies && req.cookies.sess_id) {
      this.sess_id = req.cookies.sess_id
      data = await this.get()
    }
    if (!data) {
      data = { id: uid.sync(64) }
      sessionStore.set(data.id, data)
    }
    this.sess_id = data.id
    this.data = data
    res.setCookie('sess_id', this.sess_id, {
      maxAge: options.expire || 60 * 60 * 24 * 7
    })
  }

  async set (key, value) {
    let data = await sessionStore.get(this.sess_id)
    if (!data) {
      data = {}
    }
    data[key] = value
    sessionStore.set(this.sess_id, data)
  }

  get (key) {
    let result = sessionStore.get(this.sess_id)
    return result
  }

  delete () {
    sessionStore.delete(this.sess_id)
  }
}

export default function () {
  console.log('=====================================================================')
  this.session = new Session()
  this.session.init(this, this.res)
  console.log(this.session.sess_id)
  return null
}
