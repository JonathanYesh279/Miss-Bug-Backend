import { loggerService } from '././../../services/logger.service.js'

export function log(req, res, next) {
  loggerService.info('Request was made', {
    medthod: req.method,
    url: req.url,
    cookie: req.cookies,
  })

  next()
}
