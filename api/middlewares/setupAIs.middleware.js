import { authService } from '../auth/auth.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export async function setupAsyncLocalStorage(req, res, next) {
  const storage = {}

  asyncLocalStorage.run(storage, () => {
    if (!req.cookies?.loginToken) return next()
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    
    if (loggedinUser) {
      const alsStore = asyncLocalStorage.getStore()
      alsStore.loggedInUser = loggedinUser
    }
    next()
  })
}