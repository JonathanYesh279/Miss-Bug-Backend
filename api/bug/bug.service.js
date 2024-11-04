import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'
import { asyncLocalStorage } from '../../services/als.service.js'


export const bugService = {
  query,
  getById,
  remove,
  save,
}


async function query(filterBy = {}, sortOpts = {}, pageOpts = {}) {
  try {
    const collection = await dbService.getCollection('bugs')
    
    // Filtering
    const criteria = {}

    if (filterBy.title) {
      criteria.title = { $regex: filterBy.title, $options: 'i' }
    }

    if (filterBy.creator) {
      criteria['creator._id'] = filterBy.creator
    }

    if (filterBy.minSeverity) {
      criteria.severity = { $gte: +filterBy.minSeverity }
    }

    // Sorting
    const sortCriteria = {}
    if (sortOpts.sortBy) {
      sortCriteria[sortOpts.sortBy] = sortOpts.sortDir === 1 ? 1 : -1
    }

    // Pagination
    const { pageIdx = 0, pageSize = 5 } = pageOpts

    const totalCount = await collection.countDocuments(criteria)  
    const totalPages = Math.ceil(totalCount / pageSize)

    // get the bugs
    const bugs = await collection
      .find(criteria)
      .sort(sortCriteria)
      .skip(pageIdx * pageSize)
      .limit(pageSize)
      .toArray()
    
    return { bugs, totalPages }
  } catch (err) {
    loggerService.error('Cannot get bugs', err)
    throw new Error('Could not get bugs')
  }
}

async function getById(bugId) {
  try {
    const collection = await dbService.getCollection('bugs')
    const objId = ObjectId.createFromHexString(bugId)
    const bug = await collection.findOne({ _id: objId })
    return bug
  } catch (err) {
    loggerService.error(`Cannot get bug ${bugId}`, err)
    throw new Error('Could not get bug')
  }
}

async function remove(bugId) {
  const { loggedinUser } = asyncLocalStorage.getStore()

  try {
    const collection = await dbService.getCollection('bugs')
    const objId = await collection.findOne({ _id: ObjectId.createFromHexString(bugId) })

    if (!objId) throw new Error('Could not find bug')
    if (!loggedinUser.isAdmin && bug.creator._id !== loggedinUser._id) throw new Error('Not authorized to remove this bug')
    
    await collection.deleteOne({ _id: objId })
  } catch (err) {
    loggerService.error(`Cannot remove bug ${bugId}`, err)
    throw new Error('Could not remove bug')
  }
}

async function save(bugToSave) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  
  try {
    const collection = await dbService.getCollection('bugs')

    const bugToInsert = {
      title: bugToSave.title,
      severity: +bugToSave.severity,
      description: bugToSave.description,
      createdAt: bugToSave.createdAt || Date.now(),
      creator: loggedinUser ? {
        _id: loggedinUser._id,
        username: loggedinUser.username,
        fullname: loggedinUser.fullname,
      } : null,
    }

    if (bugToSave._id) {
      const objId = ObjectId.createFromHexString(bugToSave._id)
      await collection.updateOne(
        { _id: objId },
        { $set: bugToInsert }
      )
      return { ...bugToSave, _id: bugToSave._id }
    } else {
      const result = await collection.insertOne(bugToInsert)
      return { ...bugToInsert, _id: result.insertedId }
    }
  } catch (err) {
    loggerService.error('Cannot save bug', err)
    throw new Error('Could not save bug')
  }
}

