import { msgService } from './msg.service'
import { loggerService } from '../../services/logger.service'
import { log } from './../middlewares/log.middleware';


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
    const { loggedInUser } = req.session
    if (!loggedInUser) return res.status(401).send('Not authorized')
    
    const msg = {
      txt: req.body.txt,
      aboutBugId: req.body.aboutBugId,
      byUserId: loggedInUser._id,
      createAt: Date.now()
    }

    const addedMsg = await msgService.addMsg(msg)
    res.json(addedMsg)
  } catch (err) {
    loggerService.error('Failed to add msg', err)
    res.status(500).send({ err: 'Failed to add msg' })
  }
}

export async function removeMsg(req, res) {
  try {
    const { loggedInUser } = req.session
    if (!loggedInUser) return res.status(401).send('Not authorized')
    
    const removedId = await msgService.removeMsg(req.params.id)
    res.send({ msg: 'Message has been removed successfully', msgId: removedId })
  } catch (err) {
    loggerService.error('Failed to remove msg', err)  
    res.status(500).send({ err: 'Failed to remove msg' })
  }
}


