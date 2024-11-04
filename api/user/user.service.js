import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'
import { loggerService } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'


export const userService = {
  query,
  getById,
  getByUsername,
  remove,
  save,
}

async function query() {
  try {
    const collection = await dbService.getCollection('users')
    const users = await collection.find({}).toArray()
    
    users.forEach(user => delete user.password)
    return users
  } catch (err) {
    loggerService.error('Cannot get users', err)
    throw new Error('Cannot get users')
  }
}

async function getById(userId) {
  try {
    const collection = await dbService.getCollection('user')
    const objId = ObjectId.createFromHexString(userId)
    const user = await collection.findOne({ _id: objId })
    if (!user) throw new Error(`Could not get user:${userId}`)
    delete user.password
    return user
  } catch (err) {
    loggerService.error(err)
    throw new Error(`Could not get user:${userId}`)
  }
}

async function getByUsername(username) { 
  try {
    const collection = await dbService.getCollection('user')
    const user = await collection.findOne({ username })
    return user
  } catch (err) {
    loggerService.error('UserService[getByUsername] - failed to get user', err)
    throw new Error('Could not get user')
  }
}

async function remove(userId) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  try {
    if (!loggedinUser.isAdmin) throw new Error('You are not allowed to remove users')
    const collection = await dbService.getCollection('users')
    const objId = ObjectId.createFromHexString(userId)
    await collection.deleteOne({ _id: objId })
  } catch (err) {
    loggerService.error(err)
    throw new Error('Could not remove user')
  }
}

async function save(userToSave) {
  try {
    const collection = await dbService.getCollection('users')
    
    const userToInsert = {
      username: userToSave.username,
      password: userToSave.password,
      fullname: userToSave.fullname,
      score: userToSave.score || 0,
      isAdmin: userToSave.isAdmin || false,
      imgUrl: userToSave.imgUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${userToSave.username}`,
      createdAt: userToSave.createdAt || Date.now()
    }

    if (userToSave._id) {
      const objId = ObjectId.createFromHexString(userToSave._id)
      const { _id, ...userToUpdate } = userToInsert
      await collection.updateOne(
        { _id: objId },
        { $set: userToUpdate }
      )
      return { ...userToUpdate, _id: userToSave._id }
    } else {
      const result = await collection.insertOne(userToInsert)
      return { ...userToInsert, _id: result.insertedId }
    }
  } catch (err) {
    loggerService.error(err)
    throw new Error('Could not save user')
  }
}


