import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'


export const msgService = {
  query,
  getById,
  addMsg,
  removeMsg
}

async function query(filterBy = {}) {
  try {
    const collection = await dbService.getCollection('msgs')
    
    const pipeline = [
      {
        $match: filterBy
      },
      {
        $lookup: {
          from: 'bugs',
          localField: 'aboutBugId',
          foreignField: '_id',
          as: 'aboutBug'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'byUserId',
          foreignField: '_id',
          as: 'byUser'
        }
      },
      {
        $project: {
          _id: 1,
          txt: 1,
          'aboutBug': { $arrayElemAt: ['$aboutBug', 0] },
          'byUser': {
            _id: { $arrayElemAt: ['$byUser._id', 0] },
            fullname: { $arrayElemAt: ['$byUser.fullname', 0] },
          }
        }
      }
    ]

    const msgs = await collection.aggregate(pipeline).toArray()
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
    const { loggedinUser } = asyncLocalStorage.getStore()
    if (!loggedinUser) throw new Error('Must be logged in to add msg')
    
    const msgToInsert = {
      txt: msgToAdd.txt,
      aboutBugId: ObjectId.createFromHexString(msgToAdd.aboutBugId),
      byUserId: ObjectId.createFromHexString(loggedinUser._id),
      createdAt: Date.now()
    }

    const collection = await dbService.getCollection('msgs')
    await collection.insertOne(msgToInsert) 
    return msgToInsert
  } catch (err) {
    loggerService.error('Cannot add msg', err)
    throw new Error('Could not add msg')
  }
}

async function removeMsg(msgId) {
  try {
    const { loggedinUser } = asyncLocalStorage.getStore()
    
    if (!loggedinUser) throw new Error('Must be logged in to remove msg')
    if (!loggedinUser.isAdmin) throw new Error('Must be admin to remove msg')
    
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