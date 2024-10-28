import { loggerService } from '../../services/logger.service.js';
import { utilService } from '../../services/util.service.js'

export const bugService = {
  query,
  getById,
  remove,
  save,
}

const bugs = utilService.readJsonFile('./data/bug.json');

async function query(filterBy = {}, sortOpts = {}, pageOpts = {}) {
  var filteredBugs = [...bugs]

  // Filtering
  try {
    if (filterBy.title) {
      const regExp = new RegExp(filterBy.title, 'i');
      filteredBugs = filteredBugs.filter((bug) => regExp.test(bug.title));
    }

    if (filterBy.minSeverity) {
      filteredBugs = filteredBugs.filter((bug) => bug.severity >= filterBy.minSeverity)
    }

    if (filterBy.label) {
      filteredBugs = filteredBugs.filter((bug) =>
        bug.labels.some((label) =>
          label.toLowerCase().includes(filterBy.label.toLowerCase())
        )
      )
    }

    // Sorting
    if (sortOpts.sortBy === 'severity') {
      const dir = sortOpts.sortDir === 1 ? 1 : -1
      filteredBugs.sort((a, b) => dir * (a.severity - b.severity))
      console.log(filteredBugs)
    } else if (sortOpts.sortBy === 'createdAt') {
      const dir = sortOpts.sortDir === 1 ? 1 : -1
      filteredBugs.sort((a, b) => dir * (a.createdAt - b.createdAt))
    } else if (sortOpts.sortBy === 'title') {
      const dir = sortOpts.sortDir === 1 ? 1 : -1
      filteredBugs.sort((a, b) => dir * a.title.localeCompare(b.title))
    }
  
    // Pagination
    const { pageIdx = 0, pageSize = 5 } = pageOpts
    const startIdx = pageIdx * pageSize
    const totalPages = Math.ceil(filteredBugs.length / pageSize)

    return {
      bugs: filteredBugs.slice(startIdx, startIdx + pageSize),
      totalPages
    }
  } catch (err) {
    loggerService.error(err)
    throw 'Could not get bugs'
  }
}

async function getById(bugId) {
  const bug = bugs.find((bug) => bug._id === bugId)
  return bug;
}

async function remove(bugId) {
  const idx = bugs.findIndex((bug) => bug._id === bugId);
  if (idx !== -1) {
    bugs.splice(idx, 1);
    await _saveBugs();
  }
}

async function save(bugToSave, loggedinUser) {
  bugToSave = {
    _id: bugToSave._id || '',
    title: bugToSave.title,
    severity: +bugToSave.severity,
    description: bugToSave.description,
    createdAt: bugToSave.createdAt || Date.now(),
    creator: loggedinUser ? {
      _id: loggedinUser._id,
      fullname: loggedinUser.fullname,
    } : null
  }

  if (bugToSave._id) {
    const idx = bugs.findIndex((bug) => bug._id === bugToSave._id)
    if (idx !== -1) {
      bugs[idx] = {
        ...bugs[idx],
        ...bugToSave,
        creator: bugs[idx].creator,
      }
    } else {
      throw new Error(`Bug ${bugToSave._id} not found`)
    }
  } else {
    bugToSave._id = utilService.makeId()
    bugs.push(bugToSave)
  }
  await _saveBugs()
  return bugToSave
}

async function _saveBugs() {
  await utilService.writeJsonFile('./data/bug.json', bugs);
}
