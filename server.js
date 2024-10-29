import express from 'express'
import cors from 'cors'
import path from 'path'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

import { authRoutes } from './api/auth/auth.routes.js'
import { bugRoutes } from './api/bug/bug.routes.js'
import { userRoutes } from './api/user/user.routes.js'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()

// const corsOptions = {
//   origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
//   credentials: true,
// }


const app = express()
const port = process.env.PORT || 3030


app.use(express.static('public'))
app.use(express.static('Client'))
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.json())


// ROUTES
app.use('/api/auth', authRoutes)
app.use('/api/bug', bugRoutes)
app.use('/api/user', userRoutes)



app.get('/**', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'Client/index.html', 'index.html'))
})

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})