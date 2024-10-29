import { loggerService } from '../../services/logger.service.js'
import { authService } from './auth.service.js'


export async function login(req, res) {
  const { username, password } = req.body

  try {
    const user = await authService.login(username, password)
    loggerService.info('User logged in', user)

    const loginToken = authService.getLoginToken(user)
    res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })

    res.json(user)
  } catch (err) {
    loggerService.error('Failed to login ' + err)
    res.status(401).send({ err: 'Failed to login' })
  }
}

export async function signup(req, res) {
  try {
    const credentials = req.body

     if (!credentials.username || !credentials.password || !credentials.fullname) {
      return res.status(400).json({ err: 'All fields are required' })
    }
    
    const account = await authService.signup(credentials)
    loggerService.info('User logged in', account)

    const loginToken = authService.getLoginToken(account)
    
    res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
    res.json(account)
  } catch (err) {
    loggerService.error('Failed to signup ' + err)
    res.status(401).send({ err: 'Failed to signup' })
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie('loginToken')
    res.send({ msg: 'Logged out successfully' })
  } catch (err) {
    loggerService.error('Failed to logout ' + err)
    res.status(400).send({ err: 'Failed to logout' })
  }
}