import { MongoClient } from 'mongodb'
import { config } from '../config/index.js'
import { loggerService } from './logger.service.js'

var dbConn = null

export const dbService = {
  getCollection,
  connect: connectToDB
}

// Connect to DB
async function connectToDB() {
  try {
    const collection = await dbService.getCollection('bugs')
    console.log('Connected to MongoDB')
    return collection
  } catch (err) {
    console.error('Cannot connect to MongoDB', err) 
    throw new Error('Cannot connect to MongoDB')
    }
}

async function getCollection(collectionName) {
  try {
    const db = await connect()
    if (!db) throw new Error('Cannot connect to DB')
    
    const collection =  db.collection(collectionName)
    if (!collection) throw new Error(`Collection ${collectionName} not found`)
    return collection
  } catch (err) {
    loggerService.error('Cannot connect to DB', err)
    throw new Error('Cannot connect to DB')
  }
}

async function connect() {
  if (dbConn) return dbConn
  try {
    const client = await MongoClient.connect(config.dbURL)
    dbConn = client.db(config.dbName)
    console.log(`Connected to Database: ${config.dbName}`)
    return dbConn
  } catch (err) {
    loggerService.error('Cannot Connect to DB', err)
    throw new Error('Cannot Connect to DB')    
  }
}