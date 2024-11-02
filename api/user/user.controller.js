import { loggerService } from '../../services/logger.service.js' 
import { userService } from './user.service.js'

export async function getUsers(req, res) {
  try {
    if (!req.loggedinUser.isAdmin) return res.status(403).send('You are not allowed to get users')
    
    const users = await userService.query()
    res.json(users)
  } catch (err) {
    loggerService.error(err)
    res.status(400).send('Could not get users')
  }
}

export async function getUser(req, res) {
  try {
    const userId = req.params.userId
    const user = await userService.getById(userId)
    res.json(user)
  } catch (err) {
    loggerService.error(err)
    res.status(400).send('Could not get user')
  }
}

export async function addUser(req, res) {
  try {
    const user = req.body
    const addedUser = await userService.save(user)  
    res.json(addedUser)
  } catch (err) {
    loggerService.error(err)
    res.status(400).send('Could not add user')
  }
}

export async function updateUser(req, res) {
  try {
    const user = req.body
    const updatedUser = await userService.save(user)
    res.json(updatedUser)
  } catch (err) {
    loggerService.error(err)
    res.status(400).send('Could not update user')
  }
}

export async function removeUser(req, res) {
  try {
    const { userId } = req.params
    const loggedinUser = req.loggedinUser
    await userService.remove(userId, loggedinUser)
    res.send('User deleted successfully')
  } catch (err) {
    loggerService.error(err)
    res.status(400).send('Could not delete user')
  }
}
