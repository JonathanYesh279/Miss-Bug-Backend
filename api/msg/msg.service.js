import { ObjectId } from 'mongodb'
import { dbService } from '../db/db.service' 
import { loggerService } from '../../services/logger.service'


export const msgService = {
  query,
  getById,
  addMsg,
  removeMsg
}

async function query(filterBy = {}) {
  try {
    const collection = await dbService.getCollection('msg')
    const criteria = {}

    if (filterBy.bugId) {
      criteria.aboutBugId = new ObjectId(filterBy.bugId)
    }

    const msgs = await collection.find(criteria).toArray()
    return msgs
  } catch (err) {
    loggerService.error('Cannot query msgs', err)
    throw new Error('Could not query msgs')
  }
}

async function getById(msgId) {
  try {
    const collection = await dbService.getCollection('msg')
    const msg = await collection.findOne({ _id: ObjectId.createFromHexString(msgId) })  
    return msg
  } catch (err) {
    loggerService.error('Cannot get msg', err)
    throw new Error('Could not get msg')
  }
}

async function addMsg(msgToAdd) {
  try {
    msg.aboutBugId = ObjectId.createFromHexString(msg.aboutBugId)
    msg.byUserId = ObjectId.createFromHexString(msg.byUserId)

    const collection = await dbService.getColelction('msg')
    await collection.insertOne(msgToAdd) 
    return msgToAdd
  } catch (err) {
    loggerService.error('Cannot add msg', err)
    throw new Error('Could not add msg')
  }
}

async function removeMsg(msgId) {
  try {
    const collection = await dbService.getCollection('msg')
    await collection.deleteOne({ _id: ObjectId.createFromHexString(msgId) })  
    return msgId
  } catch (err) {
    loggerService.error('Cannot remove msg', err)
    throw new Error('Could not remove msg')
  }
}