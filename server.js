import express from 'express'
import cors from 'cors'
import path from 'path'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import { authRoutes } from './api/auth/auth.routes.js'
import { bugRoutes } from './api/bug/bug.routes.js'
import { userRoutes } from './api/user/user.routes.js'

dotenv.config()

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://miss-bug-backend-2s2z.onrender.com'
    : ['http://127.0.0.1:5173', 'http://localhost:5173'],
  credentials: true
}

const app = express()
const port = process.env.PORT || 3030

console.log('Environment:', process.env.NODE_ENV);
console.log('Static files path:', path.resolve('public'));

app.use(express.static('public'))
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.json())

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
// ROUTES
app.use('/api/auth', authRoutes)
app.use('/api/bug', bugRoutes)
app.use('/api/user', userRoutes)


app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err)
  res.status(500).send({ error: 'Internal Server Error' })
})

// Start server
app.listen(port, () => {
  console.log(
    `Server is running on port ${port} (${process.env.NODE_ENV} mode)`
  );
});