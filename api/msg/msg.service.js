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

async function addMsg(msgToAdd, loggedinUser) {
  try {
    if (!loggedinUser) throw new Error('Must be logged in to add msg')
    
    const msgToInsert = {
      _id: ObjectId(),
      txt: msgToAdd.txt,
      aboutBugId: ObjectId.createFromHexString(msgToAdd.aboutBugId),
      byUserId: ObjectId.createFromHexString(loggedinUser._id),
      createdAt: Date.now()
    }

    const collection = await dbService.getColelction('msgs')
    await collection.insertOne(msgToInsert) 
    return msgToInsert
  } catch (err) {
    loggerService.error('Cannot add msg', err)
    throw new Error('Could not add msg')
  }
}

async function removeMsg(msgId, loggedinUser) {
  try {
    if (!loggedinUser) throw new Error('Must be logged in to remove msg')
    
    const collection = await dbService.getCollection('msgs')
    const msg = await collection.findOne({ _id: ObjectId.createFromHexString(msgId) })
    
    if (!loggedinUser.isAdmin && msg.byUserId.toString() !== loggedinUser._id) {
      throw new Error('Not authorized to remove msg')
    }

    await collection.deleteOne({  _id: ObjectId.createFromHexString(msgId) })
    return msgId
  } catch (err) {
    loggerService.error('Cannot remove msg', err)
    throw new Error('Could not remove msg')
  }
}