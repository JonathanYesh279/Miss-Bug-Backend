import express from 'express'
import { requireAuth } from '../middlewares/require-auth.middleware'
import { getMsgs, addMsg, removeMsg } from './msg.controller'

const router = express.Router()

router.get('/', getMsgs)
router.post('/', requireAuth, addMsg)
router.delete('/:msgId', requireAuth, removeMsg)

export const msgRoutes = router