import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'

export const userService = {
  query,
  getById,
  getByUsername,
  remove,
  save,
}

const users = utilService.readJsonFile('./data/user.json')

async function query() {
  return users
}

async function getById(userId) {
  try {
    const user = users.find((user) => user._id === userId)
    if (!user) throw new Error(`Could not get user:${userId}`)
    return user
  } catch (err) {
    loggerService.error(err)
    throw new Error(`Could not get user:${userId}`)
  }
}

async function getByUsername(username) { 
  try {
    const user = users.find((user) => user.username === username)
    return user
  } catch (err) {
    loggerService.error('UserService[getByUsername] - failed to get user', err)
    throw err
  }
}

async function remove(userId) {
  try {
    const idx = users.findIndex((user) => user._id === userId)
    if (idx !== -1) {
      users.splice(idx, 1)
      await _saveusers()
    }
  } catch (err) {
    loggerService.error(err)
    throw 'Could not remove user'
  }
}

async function save(userToSave) {
  try {
    if (userToSave._id) {
      const idx = users.findIndex(user => user._id === userToSave._id)
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...userToSave }
      } else {
        throw new Error(`User ${userToSave._id} not found`)
      }
    } else {
      userToSave._id = utilService.makeId()
      userToSave.createdAt = Date.now()
      userToSave.score = 0
      userToSave.imgUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${userToSave.username}`;
      users.push(userToSave)
    }
    await _saveusers()
    return userToSave
  } catch (err) {
    loggerService.error(err)
    throw new Error('Could not save user')
  }
}

async function _saveusers() {
   try {
     await utilService.writeJsonFile('./data/user.json', users)
   } catch (err) {
     loggerService.error('Failed to save users to file', err)
     throw err
   }
}
