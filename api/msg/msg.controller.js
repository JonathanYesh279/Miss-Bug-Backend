import { msgService } from './msg.service'
import { loggerService } from '../../services/logger.service'



export async function getMsgs(req, res) {
  try {
    const msgs = await msgService.query(req.query)
    res.send(msgs)
  } catch (err) {
    loggerService.error('Failed to get msgs', err)
    res.status(500).send({ err: 'Failed to get msgs' })
  }
}

export async function addMsg(req, res) {
  try {
    const loggedinUser = req.loggedinUser
    if (!loggedinUser) throw new Error('Must be logged in to add msg')
    
    const msg = {
      ...req.body,
      byUserId: loggedinUser._id
    }

    const addedMsg = await msgService.addMsg(msg, loggedinUser)
    res.json(addedMsg)
  } catch (err) {
    loggerService.error('Failed to add msg', err)
    res.status(500).send({ err: 'Failed to add msg' })
  }
}

export async function removeMsg(req, res) {
  try {
    const loggedinUser = req.loggedinUser
    if (!loggedinUser) throw new Error('Must be logged in to remove msg')
    
    const { msgId } = req.params
    await msgService.removeMsg(msgId, loggedinUser)
    res.send({ msg: 'Message has been removed successfully', msgId })
  } catch (err) {
    loggerService.error('Failed to remove msg', err)
    res.status(500).send({ err: 'Failed to remove msg' })
  }
}


