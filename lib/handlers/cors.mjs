import config from '../config'

let option = config.cors || {
  origin: ['http://localhost:5000'],
  methods: ['GET'],
  credentials: false,
  allowedHeaders: []
}

let allowedOrigins, allowedMethods, credentialsAllowed, allowedHeaders, exposedHeaders

function isOriginMatch (origin) {
  if (allowedOrigins === '*') {
    return true
  } else if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
    return true
  }
  return false
}

function isMethodMatch (method) {
  return allowedMethods.includes(method)
}

function isHeaderMatch (headers) {
  return headers.reduce((acc, curr) => acc && allowedHeaders.includes(curr), true)
}

function originHeader (origin) {
  if (allowedOrigins === '*') {
    return '*'
  } else if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
    return origin
  }
}

function methodHeader () {
  return allowedMethods.join(',')
}

function headerHeader () {
  return allowedHeaders.join(',') || false
}

export default function () {
  allowedOrigins = option.origin || '*'
  allowedMethods = option.methods || ['GET', 'POST', 'HEAD', 'PUT', 'PATCH', 'DELETE']
  credentialsAllowed = option.credentials || false
  allowedHeaders = option.allowedHeaders || []
  exposedHeaders = option.exposedHeaders || []

  let isPreflight = false
  let origin = this.getHeader('origin')
  let method = this.method
  let accessControlRequestMethod = this.getHeader('Access-Control-Request-Method')
  let accessControlRequestHeader = this.getHeader('Access-Control-Request-Header')

  // Not a CORS req
  if (!origin) {
    return null
  }

  // preflight req
  if (method === 'OPTIONS' && accessControlRequestMethod) {
    if (!isMethodMatch(accessControlRequestMethod)) {
      return null
    }
    if (accessControlRequestHeader) {
      if (!isHeaderMatch(accessControlRequestHeader)) {
        return null
      }
    }
    this.res.setHeader('Access-Control-Allow-Methods', methodHeader())
    if (accessControlRequestHeader) {
      this.res.setHeader('Access-Control-Allow-Headers', headerHeader())
    }
    isPreflight = true
  }

  // normal req
  if (isOriginMatch(origin)) {
    this.res.setHeader('Access-Control-Allow-Origin', originHeader(origin))
  } else {
    this.res.end()
  }
  if (credentialsAllowed) {
    this.res.setHeader('Access-Control-Allow-Credentials', originHeader(origin))
  }
  if (!isPreflight) {
    this.res.setHeader('Access-Control-Expose-Headers', exposedHeaders.join(','))
  }

  if (isMethodMatch(method)) {
    return null
  } else {
    this.res.end()
  }
}
