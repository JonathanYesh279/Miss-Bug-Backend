import { loggerService } from '../../services/logger.service.js'
import { bugService } from './bug.service.js'

export async function getBugs(req, res) {
  const {
    title,
    minSeverity,
    label,
    sortBy = 'createdAt',
    sortDir = 1,
    pageIdx = 0,
    pageSize = 5,
  } = req.query

  const filterBy = { title, minSeverity: +minSeverity, label }
  const sortOpts = { sortBy, sortDir }
  const pagination = { pageIdx: +pageIdx, pageSize: +pageSize } 

  try {
    const { bugs, totalPages} = await bugService.query(filterBy, sortOpts, pagination)
    res.json({
      bugs,
      pagination: { totalPages}
    })
  } catch (err) {
    loggerService.error('Failed to query bugs', err);
    res.status(400).send(err);
  }
}

export async function getBug(req, res) {
  try {
    const bugId = req.params.bugId
    console.log('Cookies received:', req.cookies);

    let visitedBugs = []
    if (req.cookies.visitedBugs) {
        visitedBugs = JSON.parse(req.cookies.visitedBugs)
    }

    const now = Date.now()
    visitedBugs = visitedBugs.filter(visit => now - visit.timestamp < 7000)

    const uniqueVisitedBugs = new Set(visitedBugs.map((visit) => visit.id))
    if (uniqueVisitedBugs.size >= 3 && !uniqueVisitedBugs.has(bugId)) {
      console.log('Limit reached')
      return res.status(401).send('Wait for a bit')
    }

    if (!uniqueVisitedBugs.has(bugId)) {
      visitedBugs.push({ id: bugId, timestamp: now })
    }

    console.log('Updated visitedBugs:', visitedBugs)

    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 7000 })

    const bug = await bugService.getById(bugId)
    if (!bug) {
      console.log(`Bug ${bugId} not found`);
      loggerService.warn(`Bug ${bugId} not found`)
      return res.status(404).send(`Bug ${bugId} not found`)
    }

    console.log('User visited the following bugs:', visitedBugs.map(visit => visit.id));


    res.send(bug)
  } catch (err) {
    loggerService.error(`Error getting bug ${bugId}`, err);
    res.status(500).send(`Error getting ${bugId} bug`)
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
  const { bugId } = req.params;

  try {
    await bugService.remove(bugId);
    res.send('Bug deleted');
  } catch (err) {
    loggerService.error(`Failed to delete bug ${bugId}`, err);
    res.status(400).send('Could not delete bug');
  }
}
