import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const app = express()

const PORT = 5000

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

const adapter = new PrismaPg({
  connectionString,
})

const prisma = new PrismaClient({
  adapter,
})

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MediFlow backend is running',
  })
})

app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: {
        id: 'asc',
      },
    })

    res.json(doctors)
  } catch (error) {
    console.error('Error fetching doctors:', error)

    res.status(500).json({
      message: 'Failed to fetch doctors',
    })
  }
})

app.listen(PORT, () => {
  console.log(`MediFlow backend running on http://localhost:${PORT}`)
})