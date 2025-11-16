import { PrismaClient, UserRole, CourseLevel, CourseStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edu-platforma.hr' },
    update: {},
    create: {
      email: 'admin@edu-platforma.hr',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.SUPER_ADMIN,
      isVerified: true,
      isActive: true,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create test instructor
  const instructorPassword = await bcrypt.hash('instructor123', 10)
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@edu-platforma.hr' },
    update: {},
    create: {
      email: 'instructor@edu-platforma.hr',
      password: instructorPassword,
      firstName: 'Ana',
      lastName: 'Horvat',
      role: UserRole.INSTRUCTOR,
      isVerified: true,
      isActive: true,
      profession: 'Farmaceut',
      organization: 'PharmaVision Solutions',
    },
  })
  console.log('✅ Instructor created:', instructor.email)

  // Create test learner
  const learnerPassword = await bcrypt.hash('learner123', 10)
  const learner = await prisma.user.upsert({
    where: { email: 'learner@edu-platforma.hr' },
    update: {},
    create: {
      email: 'learner@edu-platforma.hr',
      password: learnerPassword,
      firstName: 'Marko',
      lastName: 'Kovačić',
      role: UserRole.LEARNER,
      isVerified: true,
      isActive: true,
      profession: 'Farmaceut',
    },
  })
  console.log('✅ Learner created:', learner.email)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'farmakologija' },
      update: {},
      create: {
        name: 'Farmakologija',
        slug: 'farmakologija',
        description: 'Tečajevi o lijekovima i njihovom djelovanju',
        icon: '💊',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'farmakokinetika' },
      update: {},
      create: {
        name: 'Farmakokinetika',
        slug: 'farmakokinetika',
        description: 'Apsorpcija, distribucija, metabolizam i izlučivanje lijekova',
        icon: '🧪',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'klinicka-farmacija' },
      update: {},
      create: {
        name: 'Klinička farmacija',
        slug: 'klinicka-farmacija',
        description: 'Primjena farmaceutskih znanja u kliničkoj praksi',
        icon: '🏥',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'farmakovigilanca' },
      update: {},
      create: {
        name: 'Farmakovigilanca',
        slug: 'farmakovigilanca',
        description: 'Praćenje sigurnosti lijekova',
        icon: '⚠️',
      },
    }),
  ])
  console.log('✅ Categories created:', categories.length)

  // Create sample course
  const course = await prisma.course.upsert({
    where: { slug: 'osnove-farmakologije' },
    update: {},
    create: {
      title: 'Osnove farmakologije',
      slug: 'osnove-farmakologije',
      description:
        'Sveobuhvatan tečaj koji pokriva osnovne principe farmakologije, mehanizme djelovanja lijekova, farmakokinetiku i farmakodinamiku.',
      shortDescription: 'Naučite osnovne principe farmakologije i djelovanja lijekova',
      thumbnail: '/images/courses/farmakologija-thumb.jpg',
      level: CourseLevel.BEGINNER,
      status: CourseStatus.PUBLISHED,
      duration: 480, // 8 hours
      price: 199.99,
      tags: ['farmakologija', 'osnove', 'lijekovi'],
      learningObjectives: [
        'Razumjeti osnovne principe farmakologije',
        'Poznavati farmakokinetičke procese',
        'Razlikovati različite mehanizme djelovanja lijekova',
        'Primijeniti znanje u kliničkoj praksi',
      ],
      pointsReward: 500,
      cpdPoints: 8,
      creatorId: instructor.id,
      categoryId: categories[0].id,
      publishedAt: new Date(),
    },
  })
  console.log('✅ Sample course created:', course.title)

  // Create modules for the course
  const module1 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Uvod u farmakologiju',
      description: 'Osnovni pojmovi i definicije u farmakologiji',
      orderIndex: 0,
      duration: 120,
    },
  })

  const module2 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Farmakokinetika',
      description: 'ADME procesi - apsorpcija, distribucija, metabolizam, ekskrecija',
      orderIndex: 1,
      duration: 180,
    },
  })

  const module3 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Farmakodinamika',
      description: 'Mehanizmi djelovanja lijekova',
      orderIndex: 2,
      duration: 180,
    },
  })
  console.log('✅ Modules created: 3')

  // Create lessons
  await prisma.lesson.createMany({
    data: [
      {
        moduleId: module1.id,
        title: 'Što je farmakologija?',
        description: 'Uvod u farmakologiju i njene podjele',
        type: 'VIDEO',
        orderIndex: 0,
        duration: 15,
        videoUrl: 'https://example.com/video1.mp4',
        isPreview: true,
        pointsReward: 20,
      },
      {
        moduleId: module1.id,
        title: 'Povijest farmakologije',
        description: 'Razvoj farmakologije kroz povijest',
        type: 'ARTICLE',
        orderIndex: 1,
        duration: 20,
        content: '<h2>Povijest farmakologije</h2><p>Farmakologija kao znanost...</p>',
        pointsReward: 15,
      },
      {
        moduleId: module1.id,
        title: 'Test znanja - Uvod',
        description: 'Provjerite svoje razumijevanje osnovnih pojmova',
        type: 'QUIZ',
        orderIndex: 2,
        duration: 10,
        pointsReward: 30,
      },
    ],
  })
  console.log('✅ Lessons created')

  // Create badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'Prvi koraci',
        description: 'Završi svoj prvi tečaj',
        icon: '🎓',
        type: 'COMPLETION',
        criteria: { type: 'course_complete', count: 1 },
        pointsValue: 50,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Tjedan dana!',
        description: 'Održi 7-dnevni niz učenja',
        icon: '🔥',
        type: 'STREAK',
        criteria: { type: 'streak', days: 7 },
        pointsValue: 100,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Pomagač',
        description: 'Pomogni drugima na forumu',
        icon: '🤝',
        type: 'SOCIAL',
        criteria: { type: 'helpful_answers', count: 10 },
        pointsValue: 75,
      },
    }),
  ])
  console.log('✅ Badges created:', badges.length)

  // Create forum categories
  await prisma.forumCategory.createMany({
    data: [
      {
        name: 'Opća pitanja',
        description: 'Pitanja o platformi i tečajevima',
        orderIndex: 0,
      },
      {
        name: 'Farmakologija',
        description: 'Diskusije o farmakologiji',
        orderIndex: 1,
      },
      {
        name: 'Karijera',
        description: 'Savjeti o karijeri u farmaciji',
        orderIndex: 2,
      },
    ],
  })
  console.log('✅ Forum categories created')

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
