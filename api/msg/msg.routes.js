import express from 'express'
import { getMsgs, addMsg, removeMsg } from './msg.controller.js'
import { requireAuth } from '../middlewares/require-auth.middleware.js'

const router = express.Router()

router.get('/', getMsgs)
router.post('/', requireAuth, addMsg)
router.delete('/:msgId', requireAuth, removeMsg)

export const msgRoutes = router