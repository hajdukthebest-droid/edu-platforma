import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const domains = [
  // ========================================
  // 1. TECHNOLOGY & IT
  // ========================================
  {
    name: 'Tehnologija i IT',
    slug: 'tehnologija-it',
    description: 'Web development, programiranje, cloud, DevOps, cybersecurity, AI, data science',
    icon: '💻',
    color: '#3B82F6', // Blue
    order: 1,
    categories: [
      { name: 'Web Development', slug: 'web-development', icon: '🌐' },
      { name: 'Mobile Development', slug: 'mobile-development', icon: '📱' },
      { name: 'Backend Development', slug: 'backend-development', icon: '⚙️' },
      { name: 'DevOps i Cloud', slug: 'devops-cloud', icon: '☁️' },
      { name: 'Data Science', slug: 'data-science', icon: '📊' },
      { name: 'Umjetna Inteligencija', slug: 'ai', icon: '🤖' },
      { name: 'Cybersecurity', slug: 'cybersecurity', icon: '🔒' },
      { name: 'Database Administracija', slug: 'database', icon: '🗄️' },
      { name: 'UI/UX Development', slug: 'ui-ux-dev', icon: '🎨' },
      { name: 'Game Development', slug: 'game-dev', icon: '🎮' },
      { name: 'Blockchain', slug: 'blockchain', icon: '⛓️' },
      { name: 'IoT', slug: 'iot', icon: '📡' },
    ],
  },

  // ========================================
  // 2. HEALTH & MEDICINE
  // ========================================
  {
    name: 'Zdravstvo i Medicina',
    slug: 'zdravstvo-medicina',
    description: 'Farmacija, medicina, njega, farmakovigilanca, CPD, klinička istraživanja',
    icon: '🏥',
    color: '#10B981', // Green
    order: 2,
    categories: [
      { name: 'Farmacija', slug: 'farmacija', icon: '💊' },
      { name: 'Medicina', slug: 'medicina', icon: '🩺' },
      { name: 'Njega', slug: 'njega', icon: '👨‍⚕️' },
      { name: 'Farmakovigilanca', slug: 'farmakovigilanca', icon: '⚕️' },
      { name: 'Klinička Istraživanja', slug: 'klinicka-istrazivanja', icon: '🔬' },
      { name: 'Javno Zdravstvo', slug: 'javno-zdravstvo', icon: '🏛️' },
      { name: 'Fizioterapija', slug: 'fizioterapija', icon: '🤸' },
      { name: 'Dentalna Medicina', slug: 'dentalna-medicina', icon: '🦷' },
      { name: 'Veterinarska Medicina', slug: 'veterinarska-medicina', icon: '🐕' },
      { name: 'Psihologija', slug: 'psihologija', icon: '🧠' },
      { name: 'Nutricionizam', slug: 'nutricionizam', icon: '🥗' },
      { name: 'Laboratorijska Dijagnostika', slug: 'laboratorijska-dijagnostika', icon: '🧪' },
    ],
  },

  // ========================================
  // 3. BUSINESS & MANAGEMENT
  // ========================================
  {
    name: 'Poslovanje i Menadžment',
    slug: 'poslovanje-menadzment',
    description: 'MBA, strategija, projektni menadžment, vodstvo, poduzetništvo',
    icon: '💼',
    color: '#8B5CF6', // Purple
    order: 3,
    categories: [
      { name: 'Strategija Poslovanja', slug: 'strategija-poslovanja', icon: '🎯' },
      { name: 'Projektni Menadžment', slug: 'projektni-menadzment', icon: '📋' },
      { name: 'Vodstvo i Leadership', slug: 'vodstvo-leadership', icon: '👔' },
      { name: 'Poduzetništvo', slug: 'poduzetnistvo', icon: '🚀' },
      { name: 'MBA', slug: 'mba', icon: '🎓' },
      { name: 'HR Menadžment', slug: 'hr-menadzment', icon: '👥' },
      { name: 'Supply Chain', slug: 'supply-chain', icon: '🚚' },
      { name: 'Operativni Menadžment', slug: 'operativni-menadzment', icon: '⚙️' },
      { name: 'Agilne Metodologije', slug: 'agilne-metodologije', icon: '🔄' },
      { name: 'Promjene Menadžment', slug: 'promjene-menadzment', icon: '🔀' },
      { name: 'Kvaliteta i ISO', slug: 'kvaliteta-iso', icon: '✅' },
      { name: 'Rizik Menadžment', slug: 'rizik-menadzment', icon: '⚠️' },
    ],
  },

  // ========================================
  // 4. MARKETING & SALES
  // ========================================
  {
    name: 'Marketing i Prodaja',
    slug: 'marketing-prodaja',
    description: 'Digitalni marketing, SEO, SEM, content marketing, social media, prodajne tehnike',
    icon: '📣',
    color: '#EC4899', // Pink
    order: 4,
    categories: [
      { name: 'Digitalni Marketing', slug: 'digitalni-marketing', icon: '💻' },
      { name: 'SEO', slug: 'seo', icon: '🔍' },
      { name: 'SEM i PPC', slug: 'sem-ppc', icon: '💰' },
      { name: 'Content Marketing', slug: 'content-marketing', icon: '✍️' },
      { name: 'Social Media Marketing', slug: 'social-media', icon: '📱' },
      { name: 'Email Marketing', slug: 'email-marketing', icon: '📧' },
      { name: 'Marketing Automation', slug: 'marketing-automation', icon: '🤖' },
      { name: 'Brand Management', slug: 'brand-management', icon: '🏷️' },
      { name: 'Prodajne Tehnike', slug: 'prodajne-tehnike', icon: '🤝' },
      { name: 'CRM Sistemi', slug: 'crm', icon: '📊' },
      { name: 'Influencer Marketing', slug: 'influencer-marketing', icon: '⭐' },
      { name: 'Analytics i Metrike', slug: 'analytics-metrike', icon: '📈' },
    ],
  },

  // ========================================
  // 5. FINANCE & ACCOUNTING
  // ========================================
  {
    name: 'Financije i Računovodstvo',
    slug: 'financije-racunovodstvo',
    description: 'Računovodstvo, financijska analiza, revizija, porezi, investicije',
    icon: '💰',
    color: '#F59E0B', // Amber
    order: 5,
    categories: [
      { name: 'Računovodstvo', slug: 'racunovodstvo', icon: '📚' },
      { name: 'Financijska Analiza', slug: 'financijska-analiza', icon: '📊' },
      { name: 'Revizija', slug: 'revizija', icon: '🔍' },
      { name: 'Porezi', slug: 'porezi', icon: '💵' },
      { name: 'Investicije', slug: 'investicije', icon: '📈' },
      { name: 'Financijski Menadžment', slug: 'financijski-menadzment', icon: '💼' },
      { name: 'Bankarstvo', slug: 'bankarstvo', icon: '🏦' },
      { name: 'Osiguranje', slug: 'osiguranje', icon: '🛡️' },
      { name: 'Kripto i DeFi', slug: 'kripto-defi', icon: '₿' },
      { name: 'MSFI Standardi', slug: 'msfi', icon: '📋' },
      { name: 'Kontroling', slug: 'kontroling', icon: '🎯' },
      { name: 'Treasury', slug: 'treasury', icon: '💎' },
    ],
  },

  // ========================================
  // 6. CREATIVE & DESIGN
  // ========================================
  {
    name: 'Kreativnost i Dizajn',
    slug: 'kreativnost-dizajn',
    description: 'Grafički dizajn, UI/UX, fotografija, video produkcija, 3D modeling',
    icon: '🎨',
    color: '#EF4444', // Red
    order: 6,
    categories: [
      { name: 'Grafički Dizajn', slug: 'graficki-dizajn', icon: '🖼️' },
      { name: 'UI/UX Dizajn', slug: 'ui-ux-dizajn', icon: '📱' },
      { name: 'Fotografija', slug: 'fotografija', icon: '📷' },
      { name: 'Video Produkcija', slug: 'video-produkcija', icon: '🎬' },
      { name: '3D Modeling', slug: '3d-modeling', icon: '🗿' },
      { name: 'Animacija', slug: 'animacija', icon: '🎞️' },
      { name: 'Ilustracija', slug: 'ilustracija', icon: '✏️' },
      { name: 'Motion Graphics', slug: 'motion-graphics', icon: '🎥' },
      { name: 'Typography', slug: 'typography', icon: '🔤' },
      { name: 'Branding', slug: 'branding', icon: '🎭' },
      { name: 'Product Design', slug: 'product-design', icon: '📐' },
      { name: 'Interior Design', slug: 'interior-design', icon: '🏠' },
    ],
  },

  // ========================================
  // 7. LANGUAGES
  // ========================================
  {
    name: 'Jezici',
    slug: 'jezici',
    description: 'Engleski, njemački, španjolski, talijanski, francuski i drugi jezici',
    icon: '🌍',
    color: '#06B6D4', // Cyan
    order: 7,
    categories: [
      { name: 'Engleski Jezik', slug: 'engleski', icon: '🇬🇧' },
      { name: 'Njemački Jezik', slug: 'njemacki', icon: '🇩🇪' },
      { name: 'Španjolski Jezik', slug: 'spanjolski', icon: '🇪🇸' },
      { name: 'Talijanski Jezik', slug: 'talijanski', icon: '🇮🇹' },
      { name: 'Francuski Jezik', slug: 'francuski', icon: '🇫🇷' },
      { name: 'Kineski Jezik', slug: 'kineski', icon: '🇨🇳' },
      { name: 'Japanski Jezik', slug: 'japanski', icon: '🇯🇵' },
      { name: 'Korejski Jezik', slug: 'korejski', icon: '🇰🇷' },
      { name: 'Arapski Jezik', slug: 'arapski', icon: '🇸🇦' },
      { name: 'Ruski Jezik', slug: 'ruski', icon: '🇷🇺' },
      { name: 'Portugalski Jezik', slug: 'portugalski', icon: '🇵🇹' },
      { name: 'Business English', slug: 'business-english', icon: '💼' },
    ],
  },

  // ========================================
  // 8. PERSONAL DEVELOPMENT
  // ========================================
  {
    name: 'Osobni Razvoj',
    slug: 'osobni-razvoj',
    description: 'Produktivnost, komunikacija, public speaking, time management, mindfulness',
    icon: '🌱',
    color: '#84CC16', // Lime
    order: 8,
    categories: [
      { name: 'Produktivnost', slug: 'produktivnost', icon: '⚡' },
      { name: 'Komunikacijske Vještine', slug: 'komunikacijske-vjestine', icon: '💬' },
      { name: 'Public Speaking', slug: 'public-speaking', icon: '🎤' },
      { name: 'Time Management', slug: 'time-management', icon: '⏰' },
      { name: 'Mindfulness', slug: 'mindfulness', icon: '🧘' },
      { name: 'Emocionalna Inteligencija', slug: 'emocionalna-inteligencija', icon: '❤️' },
      { name: 'Kritičko Razmišljanje', slug: 'kriticko-razmisljanje', icon: '🤔' },
      { name: 'Kreativnost', slug: 'kreativnost', icon: '💡' },
      { name: 'Samopouzdanje', slug: 'samopouzdanje', icon: '💪' },
      { name: 'Networking', slug: 'networking', icon: '🤝' },
      { name: 'Karijerni Razvoj', slug: 'karijerni-razvoj', icon: '📈' },
      { name: 'Work-Life Balance', slug: 'work-life-balance', icon: '⚖️' },
    ],
  },

  // ========================================
  // 9. SCIENCE & ENGINEERING
  // ========================================
  {
    name: 'Znanost i Inženjerstvo',
    slug: 'znanost-inzenjerstvo',
    description: 'Fizika, kemija, biologija, matematika, elektroinženjerstvo, strojarstvo',
    icon: '🔬',
    color: '#6366F1', // Indigo
    order: 9,
    categories: [
      { name: 'Fizika', slug: 'fizika', icon: '⚛️' },
      { name: 'Kemija', slug: 'kemija', icon: '🧪' },
      { name: 'Biologija', slug: 'biologija', icon: '🧬' },
      { name: 'Matematika', slug: 'matematika', icon: '📐' },
      { name: 'Elektroinženjerstvo', slug: 'elektroinzenjerstvo', icon: '⚡' },
      { name: 'Strojarstvo', slug: 'strojarstvo', icon: '⚙️' },
      { name: 'Građevinarstvo', slug: 'gradjevinarstvo', icon: '🏗️' },
      { name: 'Zrakoplovstvo', slug: 'zrakoplovstvo', icon: '✈️' },
      { name: 'Automobilska Industrija', slug: 'automobilska-industrija', icon: '🚗' },
      { name: 'Robotika', slug: 'robotika', icon: '🤖' },
      { name: 'Energetika', slug: 'energetika', icon: '⚡' },
      { name: 'Ekologija', slug: 'ekologija', icon: '🌿' },
    ],
  },

  // ========================================
  // 10. LAW & LEGAL
  // ========================================
  {
    name: 'Pravo',
    slug: 'pravo',
    description: 'Poslovno pravo, radno pravo, EU pravo, ugovorno pravo, intelektualno vlasništvo',
    icon: '⚖️',
    color: '#14B8A6', // Teal
    order: 10,
    categories: [
      { name: 'Poslovno Pravo', slug: 'poslovno-pravo', icon: '💼' },
      { name: 'Radno Pravo', slug: 'radno-pravo', icon: '👔' },
      { name: 'EU Pravo', slug: 'eu-pravo', icon: '🇪🇺' },
      { name: 'Ugovorno Pravo', slug: 'ugovorno-pravo', icon: '📝' },
      { name: 'Intelektualno Vlasništvo', slug: 'intelektualno-vlasnistvo', icon: '©️' },
      { name: 'Građansko Pravo', slug: 'gradjansko-pravo', icon: '🏛️' },
      { name: 'Kazneno Pravo', slug: 'kazneno-pravo', icon: '⚖️' },
      { name: 'Upravno Pravo', slug: 'upravno-pravo', icon: '🏢' },
      { name: 'GDPR i Privatnost', slug: 'gdpr-privatnost', icon: '🔒' },
      { name: 'Porezno Pravo', slug: 'porezno-pravo', icon: '💰' },
      { name: 'Međunarodno Pravo', slug: 'medjunarodno-pravo', icon: '🌍' },
      { name: 'Compliance', slug: 'compliance', icon: '✅' },
    ],
  },

  // ========================================
  // 11. EDUCATION & TEACHING
  // ========================================
  {
    name: 'Obrazovanje i Podučavanje',
    slug: 'obrazovanje-poducavanje',
    description: 'Pedagogija, metodika nastave, e-learning, obrazovna tehnologija',
    icon: '📚',
    color: '#F97316', // Orange
    order: 11,
    categories: [
      { name: 'Pedagogija', slug: 'pedagogija', icon: '👨‍🏫' },
      { name: 'Metodika Nastave', slug: 'metodika-nastave', icon: '📖' },
      { name: 'E-Learning', slug: 'e-learning', icon: '💻' },
      { name: 'Obrazovna Tehnologija', slug: 'obrazovna-tehnologija', icon: '🖥️' },
      { name: 'Instrukcijski Dizajn', slug: 'instrukcijski-dizajn', icon: '📐' },
      { name: 'Dječja Psihologija', slug: 'djecja-psihologija', icon: '👶' },
      { name: 'Specijalna Edukacija', slug: 'specijalna-edukacija', icon: '♿' },
      { name: 'Obrazovni Menadžment', slug: 'obrazovni-menadzment', icon: '🏫' },
      { name: 'Ocjenjivanje i Testiranje', slug: 'ocjenjivanje-testiranje', icon: '📝' },
      { name: 'Razredništvo', slug: 'razrednistvo', icon: '👥' },
      { name: 'Rani Razvoj', slug: 'rani-razvoj', icon: '🧸' },
      { name: 'Andragogija', slug: 'andragogija', icon: '👴' },
    ],
  },

  // ========================================
  // 12. ARTS & HUMANITIES
  // ========================================
  {
    name: 'Umjetnost i Humanistika',
    slug: 'umjetnost-humanistika',
    description: 'Književnost, filozofija, povijest, umjetnost, glazba, film',
    icon: '🎭',
    color: '#A855F7', // Violet
    order: 12,
    categories: [
      { name: 'Književnost', slug: 'knjizevnost', icon: '📖' },
      { name: 'Filozofija', slug: 'filozofija', icon: '💭' },
      { name: 'Povijest', slug: 'povijest', icon: '📜' },
      { name: 'Likovna Umjetnost', slug: 'likovna-umjetnost', icon: '🖼️' },
      { name: 'Glazba', slug: 'glazba', icon: '🎵' },
      { name: 'Film i Kino', slug: 'film-kino', icon: '🎬' },
      { name: 'Kazalište', slug: 'kazaliste', icon: '🎭' },
      { name: 'Arheologija', slug: 'arheologija', icon: '🏺' },
      { name: 'Antropologija', slug: 'antropologija', icon: '🗿' },
      { name: 'Sociologija', slug: 'sociologija', icon: '👥' },
      { name: 'Muzikologija', slug: 'muzikologija', icon: '🎼' },
      { name: 'Kreativno Pisanje', slug: 'kreativno-pisanje', icon: '✍️' },
    ],
  },

  // ========================================
  // 13. HOSPITALITY & TOURISM
  // ========================================
  {
    name: 'Ugostiteljstvo i Turizam',
    slug: 'ugostiteljstvo-turizam',
    description: 'Hotelski menadžment, turizam, gastronomija, event management',
    icon: '🏨',
    color: '#FACC15', // Yellow
    order: 13,
    categories: [
      { name: 'Hotelski Menadžment', slug: 'hotelski-menadzment', icon: '🏨' },
      { name: 'Turizam', slug: 'turizam', icon: '✈️' },
      { name: 'Gastronomija', slug: 'gastronomija', icon: '🍽️' },
      { name: 'Event Management', slug: 'event-management', icon: '🎉' },
      { name: 'Sommelierstvo', slug: 'sommelierstvo', icon: '🍷' },
      { name: 'Barista Vještine', slug: 'barista', icon: '☕' },
      { name: 'Receptionar', slug: 'receptionar', icon: '🔔' },
      { name: 'Turistički Vodič', slug: 'turisticki-vodic', icon: '🗺️' },
      { name: 'Revenue Management', slug: 'revenue-management', icon: '📊' },
      { name: 'Wellness i Spa', slug: 'wellness-spa', icon: '💆' },
      { name: 'Održivi Turizam', slug: 'odrzivi-turizam', icon: '🌿' },
      { name: 'Kruzing', slug: 'kruzing', icon: '🚢' },
    ],
  },

  // ========================================
  // 14. AGRICULTURE & ENVIRONMENT
  // ========================================
  {
    name: 'Poljoprivreda i Ekologija',
    slug: 'poljoprivreda-ekologija',
    description: 'Agrikultura, šumarstvo, zaštita okoliša, održivi razvoj',
    icon: '🌾',
    color: '#22C55E', // Green
    order: 14,
    categories: [
      { name: 'Agrikultura', slug: 'agrikultura', icon: '🚜' },
      { name: 'Šumarstvo', slug: 'sumarstvo', icon: '🌲' },
      { name: 'Zaštita Okoliša', slug: 'zastita-okolisa', icon: '🌍' },
      { name: 'Održivi Razvoj', slug: 'odrzivi-razvoj', icon: '♻️' },
      { name: 'Ekološka Poljoprivreda', slug: 'ekoloska-poljoprivreda', icon: '🌱' },
      { name: 'Veterinarstvo', slug: 'veterinarstvo', icon: '🐄' },
      { name: 'Pčelarstvo', slug: 'pcelarstvo', icon: '🐝' },
      { name: 'Vinogradarstvo', slug: 'vinogradarstvo', icon: '🍇' },
      { name: 'Voćarstvo', slug: 'vocarstvo', icon: '🍎' },
      { name: 'Stočarstvo', slug: 'stocarstvo', icon: '🐮' },
      { name: 'Akvakultura', slug: 'akvakultura', icon: '🐟' },
      { name: 'Klimatske Promjene', slug: 'klimatske-promjene', icon: '🌡️' },
    ],
  },

  // ========================================
  // 15. SPORTS & FITNESS
  // ========================================
  {
    name: 'Sport i Fitness',
    slug: 'sport-fitness',
    description: 'Trenerski rad, fitness, yoga, nutricionizam, sportska medicina',
    icon: '⚽',
    color: '#EAB308', // Yellow
    order: 15,
    categories: [
      { name: 'Trenerski Rad', slug: 'trenerski-rad', icon: '🏃' },
      { name: 'Fitness', slug: 'fitness', icon: '💪' },
      { name: 'Yoga', slug: 'yoga', icon: '🧘' },
      { name: 'Pilates', slug: 'pilates', icon: '🤸' },
      { name: 'Sportska Nutricionizam', slug: 'sportska-nutricionizam', icon: '🥗' },
      { name: 'Sportska Medicina', slug: 'sportska-medicina', icon: '🏥' },
      { name: 'Personal Training', slug: 'personal-training', icon: '👟' },
      { name: 'CrossFit', slug: 'crossfit', icon: '🏋️' },
      { name: 'Ples', slug: 'ples', icon: '💃' },
      { name: 'Borilačke Vještine', slug: 'borilacke-vjestine', icon: '🥋' },
      { name: 'Sportski Menadžment', slug: 'sportski-menadzment', icon: '🏆' },
      { name: 'E-Sports', slug: 'e-sports', icon: '🎮' },
    ],
  },
]

export async function seedDomains() {
  console.log('🌱 Seeding domains and categories...')

  for (const domainData of domains) {
    const { categories, ...domain } = domainData

    // Create or update domain
    const createdDomain = await prisma.domain.upsert({
      where: { slug: domain.slug },
      update: domain,
      create: domain,
    })

    console.log(`  ✅ ${createdDomain.name}`)

    // Create categories for this domain
    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {
          ...category,
          domainId: createdDomain.id,
        },
        create: {
          ...category,
          domainId: createdDomain.id,
        },
      })
    }
  }

  console.log('✅ Domains and categories seeded successfully!')
}
