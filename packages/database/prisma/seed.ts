import { PrismaClient, UserRole, CourseLevel, CourseStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { seedDomains } from './seeds/domains'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...\n')

  // Seed domains and categories first
  await seedDomains()
  console.log('')

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

  // Create additional instructors
  const instructor2 = await prisma.user.upsert({
    where: { email: 'dr.kovac@edu-platforma.hr' },
    update: {},
    create: {
      email: 'dr.kovac@edu-platforma.hr',
      password: instructorPassword,
      firstName: 'Ivana',
      lastName: 'Kovač',
      role: UserRole.INSTRUCTOR,
      isVerified: true,
      isActive: true,
      profession: 'Specijalist biokemije',
      organization: 'Medicinski fakultet Zagreb',
    },
  })
  console.log('✅ Instructor 2 created:', instructor2.email)

  const instructor3 = await prisma.user.upsert({
    where: { email: 'prof.novak@edu-platforma.hr' },
    update: {},
    create: {
      email: 'prof.novak@edu-platforma.hr',
      password: instructorPassword,
      firstName: 'Ivan',
      lastName: 'Novak',
      role: UserRole.INSTRUCTOR,
      isVerified: true,
      isActive: true,
      profession: 'Profesor kardiologije',
      organization: 'KBC Zagreb',
    },
  })
  console.log('✅ Instructor 3 created:', instructor3.email)

  // Create additional learners
  const learner2 = await prisma.user.upsert({
    where: { email: 'student1@test.com' },
    update: {},
    create: {
      email: 'student1@test.com',
      password: learnerPassword,
      firstName: 'Petra',
      lastName: 'Jurić',
      role: UserRole.LEARNER,
      isVerified: true,
      isActive: true,
      profession: 'Student farmacije',
    },
  })

  const learner3 = await prisma.user.upsert({
    where: { email: 'student2@test.com' },
    update: {},
    create: {
      email: 'student2@test.com',
      password: learnerPassword,
      firstName: 'Luka',
      lastName: 'Marić',
      role: UserRole.LEARNER,
      isVerified: true,
      isActive: true,
      profession: 'Magistar farmacije',
    },
  })
  console.log('✅ Additional learners created: 2')

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

  // Create additional courses
  const course2 = await prisma.course.upsert({
    where: { slug: 'klinicka-biokemija' },
    update: {},
    create: {
      title: 'Klinička biokemija',
      slug: 'klinicka-biokemija',
      description: 'Praktična primjena biokemije u medicinskoj dijagnostici i liječenju bolesti.',
      shortDescription: 'Biokemija u kliničkoj praksi',
      thumbnail: '/images/courses/biokemija-thumb.jpg',
      level: CourseLevel.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      duration: 360,
      price: 249.99,
      tags: ['biokemija', 'dijagnostika', 'laboratorij'],
      learningObjectives: [
        'Tumačenje laboratorijskih nalaza',
        'Razumijevanje metaboličkih procesa',
        'Primjena u dijagnostici bolesti',
      ],
      pointsReward: 600,
      cpdPoints: 10,
      creatorId: instructor2.id,
      categoryId: categories[1].id,
      publishedAt: new Date(),
    },
  })

  const course3 = await prisma.course.upsert({
    where: { slug: 'osnove-kardiologije' },
    update: {},
    create: {
      title: 'Osnove kardiologije',
      slug: 'osnove-kardiologije',
      description: 'Kompletna edukacija o kardiovaskularnim bolestima, dijagnostici i liječenju.',
      shortDescription: 'Sve što trebate znati o srčanim bolestima',
      thumbnail: '/images/courses/kardiologija-thumb.jpg',
      level: CourseLevel.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      duration: 600,
      price: 349.99,
      tags: ['kardiologija', 'srce', 'dijagnostika'],
      learningObjectives: [
        'Razumijevanje srčanih bolesti',
        'EKG interpretacija',
        'Terapijski pristupi',
        'Prevencija kardiovaskularnih bolesti',
      ],
      pointsReward: 800,
      cpdPoints: 12,
      creatorId: instructor3.id,
      categoryId: categories[2].id,
      publishedAt: new Date(),
    },
  })

  const course4 = await prisma.course.upsert({
    where: { slug: 'napredna-farmakologija' },
    update: {},
    create: {
      title: 'Napredna farmakologija',
      slug: 'napredna-farmakologija',
      description: 'Detaljan pregled farmakologije sa fokusom na mehanizme djelovanja lijekova.',
      shortDescription: 'Sveobuhvatan kurs o lijekovima i njihovom djelovanju',
      thumbnail: '/images/courses/napredna-farm-thumb.jpg',
      level: CourseLevel.ADVANCED,
      status: CourseStatus.PUBLISHED,
      duration: 480,
      price: 299.99,
      tags: ['farmakologija', 'lijekovi', 'napredni'],
      learningObjectives: [
        'Razumijevanje mehanizama djelovanja lijekova',
        'Poznavanje farmakokinetike i farmakodinamike',
        'Primjena farmakoloških principa u praksi',
      ],
      pointsReward: 700,
      cpdPoints: 10,
      creatorId: instructor.id,
      categoryId: categories[0].id,
      publishedAt: new Date(),
    },
  })
  console.log('✅ Additional courses created: 3')

  // Create enrollments
  const enrollments = await Promise.all([
    prisma.enrollment.create({
      data: {
        userId: learner.id,
        courseId: course.id,
        progress: 35,
        enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: learner2.id,
        courseId: course.id,
        progress: 65,
        enrolledAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: learner2.id,
        courseId: course2.id,
        progress: 20,
        enrolledAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: learner3.id,
        courseId: course3.id,
        progress: 80,
        enrolledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: learner.id,
        courseId: course4.id,
        progress: 100,
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        enrolledAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
    }),
  ])
  console.log('✅ Enrollments created:', enrollments.length)

  // Create reviews
  await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Odličan kurs! Sve jasno objašnjeno, instruktor je vrhunski. Preporučujem svima.',
        userId: learner.id,
        courseId: course4.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Jako dobar sadržaj, ali bi moglo biti više praktičnih primjera.',
        userId: learner2.id,
        courseId: course.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Najbolji kurs o kardiologiji koji sam pohađao. Prof. Novak je izvrstan predavač.',
        userId: learner3.id,
        courseId: course3.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Kompletan i detaljan kurs. Baš ono što mi je trebalo za specijalizaciju.',
        userId: learner.id,
        courseId: course.id,
      },
    }),
  ])
  console.log('✅ Reviews created: 4')

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

  // Create tutor profiles
  const tutorProfile1 = await prisma.tutorProfile.create({
    data: {
      userId: instructor.id,
      headline: 'Iskusni farmaceut i mentor',
      bio: 'Preko 10 godina iskustva u farmaceutskoj industriji. Specijalizirani za farmakologiju i regulatorne poslove. Volim pomoći studentima da razumiju kompleksne koncepte.',
      hourlyRate: 50,
      currency: 'EUR',
      subjects: ['Farmakologija', 'Regulatorni poslovi', 'Klinička istraživanja'],
      courseIds: [],
      languages: ['hr', 'en'],
      availableHours: {
        monday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '12:00' }],
      },
      timezone: 'Europe/Zagreb',
      qualifications: ['Mag. pharm.', 'Specijalist kliničke farmakologije'],
      experience: '10+ godina u farmaceutskoj industriji',
      status: 'APPROVED',
      isAvailable: true,
      totalSessions: 25,
      totalHours: 37.5,
      averageRating: 4.8,
      totalReviews: 12,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
    },
  })

  const tutorProfile2 = await prisma.tutorProfile.create({
    data: {
      userId: instructor2.id,
      headline: 'Specijalist biokemije i molekularne biologije',
      bio: 'Predajem biokemiju na medicinskom fakultetu. Stručnjak za metabolizam lijekova i laboratorijsku dijagnostiku.',
      hourlyRate: 60,
      currency: 'EUR',
      subjects: ['Biokemija', 'Molekularna biologija', 'Laboratorijska dijagnostika'],
      languages: ['hr', 'en', 'de'],
      availableHours: {
        tuesday: [{ start: '14:00', end: '20:00' }],
        thursday: [{ start: '14:00', end: '20:00' }],
      },
      timezone: 'Europe/Zagreb',
      qualifications: ['Dr. sc.', 'Specijalist medicinske biokemije'],
      experience: '15 godina akademskog iskustva',
      status: 'APPROVED',
      isAvailable: true,
      totalSessions: 42,
      totalHours: 63,
      averageRating: 4.9,
      totalReviews: 28,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
    },
  })

  const tutorProfile3 = await prisma.tutorProfile.create({
    data: {
      userId: instructor3.id,
      headline: 'Kardiolog i klinički edukator',
      bio: 'Profesor kardiologije sa strašću za edukaciju. Posvećen prenošenju znanja novim generacijama liječnika.',
      hourlyRate: 75,
      currency: 'EUR',
      subjects: ['Kardiologija', 'Interna medicina', 'Klinička praksa'],
      languages: ['hr', 'en'],
      availableHours: {
        saturday: [{ start: '10:00', end: '14:00' }],
      },
      timezone: 'Europe/Zagreb',
      qualifications: ['Prof. dr. sc.', 'Specijalist kardiologije'],
      experience: '20+ godina kliničkog iskustva',
      status: 'APPROVED',
      isAvailable: true,
      isFeatured: true,
      totalSessions: 89,
      totalHours: 133.5,
      averageRating: 5.0,
      totalReviews: 45,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
    },
  })
  console.log('✅ Tutor profiles created: 3')

  // Create a tutoring request
  const tutoringRequest = await prisma.tutoringRequest.create({
    data: {
      studentId: learner.id,
      title: 'Pomoć s farmakologijom kardiovaskularnih lijekova',
      description: 'Trebam pomoć s razumijevanjem mehanizama djelovanja antihipertenziva i antikoagulansa. Pripremam se za ispit.',
      subject: 'Farmakologija',
      preferredLanguage: 'hr',
      urgency: 'normal',
      budgetMax: 60,
      status: 'OPEN',
    },
  })
  console.log('✅ Tutoring request created')

  // Create a completed tutoring session with review
  const tutoringSession = await prisma.tutoringSession.create({
    data: {
      tutorId: tutorProfile1.id,
      studentId: learner.id,
      title: 'Uvod u farmakokinetiku',
      description: 'Osnove farmakokinetike i ADME procesa',
      subject: 'Farmakologija',
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      duration: 60,
      status: 'COMPLETED',
      actualStartTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      actualEndTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      rate: 50,
      totalCost: 50,
      isPaid: true,
      sessionNotes: 'Prošli smo osnove ADME, apsorpciju, distribuciju, metabolizam i eliminaciju. Student pokazuje dobro razumijevanje.',
    },
  })

  await prisma.tutoringReview.create({
    data: {
      sessionId: tutoringSession.id,
      tutorId: tutorProfile1.id,
      studentId: learner.id,
      overallRating: 5,
      knowledgeRating: 5,
      communicationRating: 5,
      punctualityRating: 5,
      helpfulnessRating: 5,
      comment: 'Odlična sesija! Ana je izuzetno strpljiva i jasno objašnjava kompleksne koncepte. Preporučujem!',
      isPublic: true,
    },
  })
  console.log('✅ Tutoring session and review created')

  // Create challenges
  const weeklyChallenge = await prisma.challenge.create({
    data: {
      title: 'Tjedni Sprint: 5 Lekcija',
      description: 'Završi 5 lekcija ovaj tjedan i osvoji bonus bodove! Savršen način da ostaneš motiviran i napreduješ.',
      shortDescription: 'Završi 5 lekcija za bonus bodove',
      type: 'WEEKLY',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      goalType: 'LESSONS_COMPLETED',
      goalTarget: 5,
      pointsReward: 150,
      isPublic: true,
      createdById: admin.id,
    },
  })

  const monthlyChallenge = await prisma.challenge.create({
    data: {
      title: 'Mjesečni Maraton: 30 Minuta Dnevno',
      description: 'Uči najmanje 30 minuta dnevno kroz cijeli mjesec. Izgradi naviku kontinuiranog učenja i osvoji ekskluzivnu značku!',
      shortDescription: 'Uči 30 min dnevno cijeli mjesec',
      type: 'MONTHLY',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      goalType: 'MINUTES_LEARNED',
      goalTarget: 900, // 30 min * 30 days
      pointsReward: 500,
      isPublic: true,
      createdById: admin.id,
    },
  })

  const quizChallenge = await prisma.challenge.create({
    data: {
      title: 'Quiz Majstor',
      description: 'Položi 10 kvizova s minimalno 80% točnosti. Pokaži svoje znanje i osvoji titulu Quiz Majstora!',
      shortDescription: 'Položi 10 kvizova s 80%+ točnosti',
      type: 'SPECIAL',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      goalType: 'QUIZZES_PASSED',
      goalTarget: 10,
      pointsReward: 300,
      isPublic: true,
      createdById: admin.id,
    },
  })

  // Add participants to weekly challenge
  await prisma.challengeParticipant.createMany({
    data: [
      {
        challengeId: weeklyChallenge.id,
        userId: learner.id,
        currentProgress: 2,
      },
      {
        challengeId: weeklyChallenge.id,
        userId: learner2.id,
        currentProgress: 3,
      },
      {
        challengeId: weeklyChallenge.id,
        userId: learner3.id,
        currentProgress: 1,
      },
    ],
  })

  // Update challenge participant counts
  await prisma.challenge.update({
    where: { id: weeklyChallenge.id },
    data: { participantCount: 3 },
  })

  // Create a team
  const team = await prisma.team.create({
    data: {
      name: 'Farmaceuti Heroji',
      description: 'Tim entuzijastičnih farmaceuta koji uče zajedno!',
      isPublic: true,
      maxMembers: 10,
      captainId: learner.id,
      memberCount: 2,
      members: {
        createMany: {
          data: [
            { userId: learner.id, role: 'captain' },
            { userId: learner2.id, role: 'member' },
          ],
        },
      },
    },
  })
  console.log('✅ Challenges and team created')

  console.log('\n🎉 Seeding completed successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 Admin:')
  console.log('   Email: admin@edu-platforma.hr')
  console.log('   Password: admin123')
  console.log('\n👨‍🏫 Instructors:')
  console.log('   Email: instructor@edu-platforma.hr | Password: instructor123')
  console.log('   Email: dr.kovac@edu-platforma.hr | Password: instructor123')
  console.log('   Email: prof.novak@edu-platforma.hr | Password: instructor123')
  console.log('\n👨‍🎓 Learners:')
  console.log('   Email: learner@edu-platforma.hr | Password: learner123')
  console.log('   Email: student1@test.com | Password: learner123')
  console.log('   Email: student2@test.com | Password: learner123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n📊 Database Summary:')
  console.log(`   • 7 users (1 admin, 3 instructors, 3 learners)`)
  console.log(`   • Domains with categories`)
  console.log(`   • 4 courses (BEGINNER to ADVANCED levels)`)
  console.log(`   • Multiple modules and lessons`)
  console.log(`   • 5 enrollments with progress tracking`)
  console.log(`   • 4 course reviews`)
  console.log(`   • 3 badges for achievements`)
  console.log(`   • Forum categories`)
  console.log(`   • 3 tutor profiles (approved tutors)`)
  console.log(`   • 1 tutoring request + 1 completed session`)
  console.log(`   • 3 active challenges (weekly, monthly, special)`)
  console.log(`   • 1 team with 2 members`)
  console.log('\n🚀 You can now login and test all features!')
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
