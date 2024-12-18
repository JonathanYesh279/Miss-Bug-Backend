import express from 'express'
import cors from 'cors'
import path from 'path'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import { dbService } from './services/db.service.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { bugRoutes } from './api/bug/bug.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { msgRoutes } from './api/msg/msg.routes.js'
import { setupAsyncLocalStorage } from './api/middlewares/setupAIs.middleware.js'

dotenv.config()

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://miss-bug-backend-2s2z.onrender.com'
    : ['http://127.0.0.1:5173', 'http://localhost:5173'],
  credentials: true
}

// Connect to DB
try {
  dbService.connect()
} catch (err) {
  console.error('Cannot connect to MongoDB', err)
  process.exit(1)
}


const app = express()
const port = process.env.PORT || 3030


app.use(express.static('public'))
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.json())

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next();
})

// ROUTES
app.all('*', setupAsyncLocalStorage)
app.use('/api/auth', authRoutes)
app.use('/api/bug', bugRoutes)
app.use('/api/user', userRoutes)
app.use('/api/msg', msgRoutes)


app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})


// Start server
app.listen(port, () => {
  console.log(
    `Server is running on port ${port} (${process.env.NODE_ENV} mode)`
  )
})