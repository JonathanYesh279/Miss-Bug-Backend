import bcrypt from 'bcrypt'
import Cryptr from 'cryptr'
import dotenv from 'dotenv'

import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'



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
    const collection = await dbService.getCollection('users')
    const user = await collection.findOne({ username })
    if (!user) return null

    const match = await bcrypt.compare(password, user.password) 
    if (!match) throw new Error('Password is incorrect')
    
    const miniUser = {
      _id: user._id,
      fullname: user.fullname,
      imgUrl: user.imgUrl,
      score: user.score,
      isAdmin: user.isAdmin || false,
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
    const collection = await dbService.getCollection('users')
    const existingUser = await collection.findOne({ username })
    if (existingUser) throw new Error('Username is taken')
    
    const hashedPassword = await bcrypt.hash(password, saltRound)

    const userToSave = {
      username,
      password: hashedPassword,
      fullname,
      score: 0,
      imgUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
      isAdmin: (username === 'admin') ? true : false,
      createdAt: Date.now()
    }

    const result = await collection.insertOne(userToSave)
    return { ...userToSave, _id: result.insertedId }
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

