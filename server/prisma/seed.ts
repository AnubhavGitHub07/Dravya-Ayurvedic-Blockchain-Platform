import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...\n')

  // ─── Create initial ADMIN account ──────────────────────
  const adminEmail = 'admin@dravya.in'
  const adminPassword = 'Admin@1234'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${adminEmail}`)
  } else {
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(adminPassword, salt)

    const admin = await prisma.user.create({
      data: {
        name: 'Dravya Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        organization: 'Dravya Platform',
        isActive: true,
      },
    })

    console.log(`✅ Admin user created:`)
    console.log(`   Email:    ${admin.email}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   Role:     ${admin.role}`)
    console.log(`   ID:       ${admin.id}`)
  }

  // ─── Create initial VERIFICATION_AUTHORITY account ─────
  const vaEmail = 'verifier@dravya.in'
  const vaPassword = 'Verify@1234'

  const existingVA = await prisma.user.findUnique({
    where: { email: vaEmail },
  })

  if (existingVA) {
    console.log(`✅ Verification Authority user already exists: ${vaEmail}`)
  } else {
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(vaPassword, salt)

    const va = await prisma.user.create({
      data: {
        name: 'Government Verifier',
        email: vaEmail,
        password: hashedPassword,
        role: 'VERIFICATION_AUTHORITY',
        organization: 'Ministry of AYUSH',
        isActive: true,
      },
    })

    console.log(`✅ Verification Authority user created:`)
    console.log(`   Email:    ${va.email}`)
    console.log(`   Password: ${vaPassword}`)
    console.log(`   Role:     ${va.role}`)
    console.log(`   ID:       ${va.id}`)
  }

  // ─── Create Herb Catalog ────────────────────────────────
  const herbs = [
    {
      commonName: 'Ashwagandha',
      botanicalName: 'Withania somnifera',
      family: 'Solanaceae',
      description: 'Adaptogenic herb known for reducing stress and anxiety.',
      medicinalUse: 'Stress relief, energy, immunity.',
    },
    {
      commonName: 'Tulsi',
      botanicalName: 'Ocimum sanctum',
      family: 'Lamiaceae',
      description: 'Holy Basil, revered for its medicinal and spiritual properties.',
      medicinalUse: 'Respiratory health, immunity, stress relief.',
    },
    {
      commonName: 'Brahmi',
      botanicalName: 'Bacopa monnieri',
      family: 'Plantaginaceae',
      description: 'Known for cognitive enhancement and memory improvement.',
      medicinalUse: 'Memory, concentration, anxiety reduction.',
    },
    {
      commonName: 'Shatavari',
      botanicalName: 'Asparagus racemosus',
      family: 'Asparagaceae',
      description: 'Traditionally used to support reproductive health.',
      medicinalUse: 'Female reproductive health, digestion, immunity.',
    },
    {
      commonName: 'Neem',
      botanicalName: 'Azadirachta indica',
      family: 'Meliaceae',
      description: 'Known for its powerful antibacterial and antifungal properties.',
      medicinalUse: 'Skin health, blood purification, immunity.',
    },
    {
      commonName: 'Turmeric',
      botanicalName: 'Curcuma longa',
      family: 'Zingiberaceae',
      description: 'Contains curcumin, a potent anti-inflammatory compound.',
      medicinalUse: 'Inflammation, joint health, digestion.',
    },
  ]

  let seededHerbsCount = 0
  for (const herbData of herbs) {
    const existing = await prisma.herb.findUnique({
      where: { botanicalName: herbData.botanicalName },
    })

    if (!existing) {
      await prisma.herb.create({ data: herbData })
      seededHerbsCount++
    }
  }

  if (seededHerbsCount > 0) {
    console.log(`✅ Seeded ${seededHerbsCount} herbs into the catalog.`)
  } else {
    console.log(`✅ Herb catalog already seeded.`)
  }

  console.log('\n🌿 Seeding complete.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seeding error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
