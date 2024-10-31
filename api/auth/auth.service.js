import bcrypt from 'bcrypt'
import Cryptr from 'cryptr'
import dotenv from 'dotenv'

import { loggerService } from '../../services/logger.service.js'
import { userService } from '../user/user.service.js'

dotenv.config()

const cryptr = new Cryptr(process.env.SECRET1)

export const authService = {
  login,
  signup,
  getLoginToken,
  validateToken,
}


async function login(username, password) {
  try {
    const user = await userService.getByUsername(username)
    if (!user) return null

    const match = await bcrypt.compare(password, user.password)
      if (!match) throw new Error('Wrong password')
    
    
    const miniUser = {
      _id: user._id,
      fullname: user.fullname,
      imgUrl: user.imgUrl,
      score: user.score,
      isAdmin: username === 'admin' || user.isAdmin || false,
    }
    return miniUser
  } catch (err) { 
    console.error('Login error:', err)
    throw new Error('Could not login')
  }
}

async function signup({ username, password, fullname }) {
  const saltRound = 10

  try {
    loggerService.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
    if (!username || !password || !fullname) {
      throw new Error('All inputs are required')
    }

    const userExist = await userService.getByUsername(username)

    if (userExist) {
      console.log('Username already exists:', username)
      console.error('Username already exists:', username);
      throw new Error('Username already exists')
    }

    const hash = await bcrypt.hash(password, saltRound)
    console.log('Hash:', hash)
    const savedUser = await userService.save({ username, password: hash, fullname, isAdmin: username === 'admin' })

    return savedUser
  } catch (err) {
    loggerService.error('Failed to signup', err)
    throw new Error('Could not signup')
  }
}

function getLoginToken(user) {
  const userInfo = {
    _id: user._id,
    fullname: user.fullname,
    isAdmin: user.isAdmin || false
  }
  return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(token) { 
  try {
    const json = cryptr.decrypt(token)
    const loggedinUser = JSON.parse(json) 
    return loggedinUser 
  } catch (err) {
    loggerService.error('Failed to validate token', err)
    return null
  }
}

