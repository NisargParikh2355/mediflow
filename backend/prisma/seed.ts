import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

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

async function main() {
  await prisma.doctor.createMany({
    data: [
      {
        name: 'Dr. Patel',
        specialization: 'General Physician',
      },
      {
        name: 'Dr. Shah',
        specialization: 'Cardiologist',
      },
      {
        name: 'Dr. Mehta',
        specialization: 'Dermatologist',
      },
    ],
  })

  console.log('Doctors seeded successfully')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })