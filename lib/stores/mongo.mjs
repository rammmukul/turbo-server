import mongo from 'mongodb'

export default class mongoStore {
  async init (options) {
    let url = options.url || 'mongodb://localhost:27017/'
    this.client = mongo.MongoClient
    let db = await this.client.connect(url)
    console.log('mongo db connected...')
    this.store = db.db('session-data')
    return this
  }

  set (hash, value) {
    let data = {}
    data['sess_id'] = hash
    data['data'] = value
    let obj = {}
    obj['sess_id'] = hash
    this.store.collection('sessions').replaceOne(obj, { $set: data }, { upsert: true }, (err, res) => {
      if (err) {
        console.log(err)
      }
    })
  }

  async get (key) {
    let result = await this.store.collection('sessions').find({ sess_id: key }).toArray()
    if (result.length >= 1) {
      result = result[0]
      if (result) {
        return result['data']
      }
    }
    return null
  }

  delete (key) {
    this.store.collection('sessions').remove({ sess_id: key })
  }
}
