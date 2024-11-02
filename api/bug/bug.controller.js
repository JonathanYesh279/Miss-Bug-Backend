import { loggerService } from '../../services/logger.service.js'
import { bugService } from './bug.service.js'

export async function getBugs(req, res) {
  const {
    title,
    minSeverity,
    label,
    creator, 
    sortBy = 'createdAt',
    sortDir = 1,
    pageIdx = 0,
    pageSize = 5,
  } = req.query

  const filterBy = { title, minSeverity: +minSeverity, label, creator }
  const sortOpts = { sortBy, sortDir }
  const pagination = { pageIdx: +pageIdx, pageSize: +pageSize } 

  try {
    const { bugs, totalPages} = await bugService.query(filterBy, sortOpts, pagination)
    res.json({
      bugs,
      pagination: { totalPages}
    })
  } catch (err) {
    loggerService.error('Failed to query bugs', err)
    res.status(400).send(err)
  }
}

export async function getBug(req, res) {
  const { bugId } = req.params

  try {
    let visitedBubIds = []
    if (req.cookies.visitedBubIds) {
        visitedBubIds = JSON.parse(req.cookies.visitedBubIds)
    }

    const now = Date.now()
    visitedBubIds = visitedBubIds.filter(visit => now - visit.timestamp < 7000)

    const uniquevisitedBubIds = new Set(visitedBubIds.map((visit) => visit.id))
    if (uniquevisitedBubIds.size >= 3 && !uniquevisitedBubIds.has(bugId)) {
      console.log('Limit reached')
      return res.status(401).send('Wait for a bit')
    }

    if (!uniquevisitedBubIds.has(bugId)) {
      visitedBubIds.push({ id: bugId, timestamp: now })
    }

    res.cookie('visitedBubIds', JSON.stringify(visitedBubIds), { maxAge: 7000 })

    const bug = await bugService.getById(bugId)
    if (!bug) {
      loggerService.warn(`Bug ${bugId} not found`)
      return res.status(404).send(`Bug ${bugId} not found`)
    }
    res.json(bug)
  } catch (err) {
    loggerService.error(`Error getting bug ${bugId}`, err)
    res.status(400).send(`Error getting ${bugId} bug`)
  }
}

export async function updateBug(req, res) {
  try {
    const loggedinUser = req.loggedinUser
    if (!loggedinUser) {
      return res.status(401).send('Must be logged in to update a bug')
    }

    const existingBug = await bugService.getById(req.params.bugId)
    if (!existingBug) {
      return res.status(404).send('Bug not found')
    }

    if (existingBug.creator._id !== loggedinUser._id && !loggedinUser.isAdmin) {
      return res.status(403).send('Not authorized to update this bug')
    }

    const saveBug = await bugService.save(req.body, loggedinUser)
    res.json(saveBug)
  
  } catch (err) {
    loggerService.error('Failed to update bug', err)
    res.status(400).send(err)
  }
}

export async function addBug(req, res) {
  try {
  const loggedinUser = req.loggedinUser
  if (!loggedinUser) {
    return res.status(401).send('Must be logged in to create a bug')
    }

  const { title, severity, description } = req.body;
  const bugToSave = {
    title,
    severity: +severity,
    description,
    creator: {
      _id: loggedinUser._id,
      fullname: loggedinUser.fullname
    }
  }

  
    const saveBug = await bugService.save(bugToSave, loggedinUser)
    res.json(saveBug)
  } catch (err) {
    loggerService.error('Failed to create bug', err)
    res.status(400).send(err)
  }
}

export async function removeBug(req, res) {
  try {
    const { bugId } = req.params
    const loggedinUser = req.loggedinUser
    await bugService.remove(bugId, loggedinUser)
    res.send('Bug removed successfully')
  } catch (err) {
    loggerService.error(`Failed to delete bug ${bugId}`, err)
    res.status(400).send('Could not delete bug')
  }
}

