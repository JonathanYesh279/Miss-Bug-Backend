import express from 'express'
import { requireAuth } from '../middlewares/require-auth.middleware.js'

import { addUser, getUser, getUsers, removeUser, updateUser } from './user.controller.js'




const router = express.Router()

router.get('/', requireAuth, getUsers);
router.get('/:userId', requireAuth, getUser)
router.delete('/:userId', requireAuth, removeUser)
router.put('/:userId', requireAuth, updateUser)
router.post('/', requireAuth, addUser)

export const userRoutes = router