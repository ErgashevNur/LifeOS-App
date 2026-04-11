import { CommunityFeedItem, PersistedData } from "./types";

export const DEFAULT_FINANCE_OVERVIEW = {
  wealthScore: 92,
  monthlyGrowthPct: 12.4,
  debtCurrent: 4200,
  debtTarget: 15000,
  debtPlanHint: "Snowball usuli orqali qarzlarni 4 oyda yopishingiz mumkin.",
  savingsCurrent: 3450,
  savingsTarget: 6000,
  income: 4200,
  expense: 1800,
  investments: [
    { label: "S&P 500", val: "+8.4%", stat: "Profit" },
    { label: "Gold", val: "+2.1%", stat: "Stable" },
    { label: "Real Estate", val: "+14.2%", stat: "Rental" },
  ],
};

export const DEFAULT_COMMUNITY_FEED: CommunityFeedItem[] = [
  {
    id: 1,
    user: "Ergashev",
    role: "Admin",
    category: "Moliya",
    text: "Qarzlardan qutilish uchun eng yaxshi usul — 50/30/20 qoidasi. 50% ehtiyojlar, 30% xohishlar, 20% qarzlar uchun.",
    likes: 42,
    comments: 12,
    createdAt: "2026-04-09T15:00:00.000Z",
  },
  {
    id: 2,
    user: "Rahimov",
    role: "User",
    category: "Sog'liq",
    text: "Kuniga kamida 3 litr suv ichish diqqatni jamlashga 20% ga ko'proq yordam beradi. Sinab ko'ring!",
    likes: 85,
    comments: 24,
    createdAt: "2026-04-09T13:00:00.000Z",
  },
  {
    id: 3,
    user: "Azizbek",
    role: "User",
    category: "Unumdorlik",
    text: "LifeOS'dagi fokus sessiya moduli orqali bugun 8 soat to'xtovsiz ishladim. Tavsiya qilaman!",
    likes: 128,
    comments: 45,
    createdAt: "2026-04-09T11:00:00.000Z",
  },
];

export const DEFAULT_PERSISTED_DATA: PersistedData = {
  users: [
    {
      id: "user-1",
      firstName: "Demo",
      lastName: "Admin",
      fullName: "Demo Admin",
      email: "user@example.com",
      phone: "+998900000001",
      address: "Toshkent shahar, Yunusobod tumani",
      region: "Toshkent",
      city: "Toshkent",
      district: "Yunusobod",
      profession: "Administrator",
      role: "admin",
      password: "$2b$10$MJOFr5f9zjAzhJKT.3RZV.NaKbJy7sKTyyZYQGLmVQMbuJcnozzgy",
      tokenVersion: 1,
      refreshTokenId: null,
      createdAt: "2026-03-01T00:00:00.000Z",
    },
  ],
  state: {
    content: {
      landing: {
        heroStats: {
          goalsCount: "128,400+",
          productivityGrowth: "+48%",
        },
        stats: [
          { value: "10K+", label: "foydalanuvchi" },
          { value: "500K+", label: "maqsad" },
          { value: "1M+", label: "streak kun" },
        ],
        features: [
          {
            title: "Goal",
            description: "Yillikdan kunlikgacha maqsadlarni bir joyda kuzating.",
            icon: "Target",
          },
          {
            title: "AI",
            description: "Shaxsiy produktivlik kouchi orqali aniq tavsiyalar oling.",
            icon: "Brain",
          },
          {
            title: "Habits",
            description: "40 kunlik odat murabbiyi va streak nazorati.",
            icon: "Zap",
          },
          {
            title: "Gamification",
            description:
              "Coin, challenge va mukofot tizimi bilan motivatsiyani oshiring.",
            icon: "Trophy",
          },
          {
            title: "Books",
            description: "O'qish progressi, izoh va reytinglar bilan ishlang.",
            icon: "BookOpen",
          },
          {
            title: "Analytics",
            description: "Jarayonni grafiklar orqali tahlil qilib boring.",
            icon: "TrendingUp",
          },
        ],
        founders: [
          {
            name: "Ergashev MuhammadNurulloh",
            role: "Dasturchi",
            image: "/founder1.jpg",
            description:
              "Frontend va backend qismlarini birlashtirib, LifeOS'ni tez, toza va kengaytirishga qulay arxitekturada quradi.",
          },
          {
            name: "Rahimov Asadbek",
            role: "UI/UX va Data Science",
            image: "/founder2.jpg",
            description:
              "Interfeys tajribasini foydalanuvchi odatlariga moslaydi, ma'lumotlardan insight olib mahsulot qarorlarini kuchaytiradi.",
          },
        ],
      },
      dashboard: {
        quickModules: [
          { title: "Maqsadlar", to: "/goals" },
          { title: "Odatlar", to: "/habits" },
          { title: "Kitoblar", to: "/books" },
          { title: "AI Yordamchi", to: "/assistant" },
          { title: "Sog'liq", to: "/healthy-life" },
          { title: "Tarmoq", to: "/networking" },
        ],
      },
      assistant: {
        quickPrompts: [
          "Odatlar qanday shakllantirish?",
          "Fokus qanday oshirish?",
          "Ertangi kun uchun reja tuzib ber.",
          "Streak pasaysa nima qilay?",
        ],
      },
      books: {
        categories: ["Badiiy", "Tarixiy", "Shaxsiy Rivojlanish", "Biznes"],
      },
      health: {
        foodDatabase: [
          { id: 1, name: "Avocado Toast", calories: 320 },
          { id: 2, name: "Grilled Salmon", calories: 410 },
          { id: 3, name: "Oatmeal", calories: 210 },
          { id: 4, name: "Chicken Salad", calories: 280 },
          { id: 5, name: "Greek Yogurt Bowl", calories: 190 },
        ],
      },
      mastery: {
        milestones: [100, 500, 1000, 2000, 3000, 4000],
      },
      settings: {
        languages: ["O'zbek", "Русский", "English", "Deutsch"],
      },
    },
    dashboard: {
      tasks: [
        { id: "task-1", title: "Kunlik 3 ta prioritet yozish", done: true },
        { id: "task-2", title: "30 daqiqa fokus sessiya", done: false },
        { id: "task-3", title: "10 sahifa kitob o'qish", done: false },
      ],
    },
    goals: [
      {
        id: "goal-1",
        title: "Yil yakunigacha 12 ta kitob",
        period: "Yillik",
        targetValue: 12,
        currentValue: 7,
        deadline: "2026-12-31",
      },
      {
        id: "goal-2",
        title: "Har oy 20 fokus sessiya",
        period: "Oylik",
        targetValue: 20,
        currentValue: 13,
        deadline: "2026-04-30",
      },
      {
        id: "goal-3",
        title: "Haftalik review 1 marta",
        period: "Haftalik",
        targetValue: 1,
        currentValue: 0,
        deadline: "2026-04-05",
      },
    ],
    habits: [
      {
        id: "habit-1",
        title: "Ertalab 20 daqiqa o'qish",
        streak: 12,
        longestStreak: 23,
        completedDays: 29,
        completedToday: true,
      },
      {
        id: "habit-2",
        title: "Kuniga 2 litr suv",
        streak: 8,
        longestStreak: 18,
        completedDays: 25,
        completedToday: false,
      },
      {
        id: "habit-3",
        title: "30 daqiqa sport",
        streak: 6,
        longestStreak: 12,
        completedDays: 20,
        completedToday: true,
      },
    ],
    books: [
      {
        id: "book-1",
        title: "O'tkan Kunlar",
        author: "Abdulla Qodiriy",
        category: "Badiiy",
        pages: 320,
        readPages: 210,
        rating: 5,
        note: "Tarixiy ruh va obrazlar kuchli.",
        likes: 8,
        comments: ["Kitob juda foydali ekan.", "2-bobdagi fikrlar yoqdi."],
      },
      {
        id: "book-2",
        title: "Atomic Habits",
        author: "James Clear",
        category: "Shaxsiy Rivojlanish",
        pages: 306,
        readPages: 306,
        rating: 5,
        note: "Kichik odatlar katta natija beradi.",
        likes: 12,
        comments: ["Amaliy maslahatlar juda zo'r."],
      },
      {
        id: "book-3",
        title: "The Lean Startup",
        author: "Eric Ries",
        category: "Biznes",
        pages: 280,
        readPages: 40,
        rating: 4,
        note: "MVP va iteratsiya bo'yicha amaliy kitob.",
        likes: 6,
        comments: ["Yaxshi boshlanish."],
      },
    ],
    health: {
      calories: 1450,
      waterMl: 1250,
      sleepHours: 7.5,
      logs: [
        { id: "hl-1", day: "Dushanba", calories: 2100, waterMl: 2100, sleepHours: 7.4 },
        { id: "hl-2", day: "Seshanba", calories: 1980, waterMl: 2400, sleepHours: 7.9 },
        { id: "hl-3", day: "Chorshanba", calories: 2260, waterMl: 2000, sleepHours: 6.8 },
        { id: "hl-4", day: "Payshanba", calories: 2030, waterMl: 2300, sleepHours: 7.2 },
      ],
    },
    mastery: {
      skills: [
        { id: "skill-1", name: "React Architecture", hours: 460 },
        { id: "skill-2", name: "UI/UX Practice", hours: 310 },
        { id: "skill-3", name: "Data Science", hours: 725 },
      ],
      focusSessions: [
        { id: "fs-1", date: "2026-03-31", durationMin: 45, skillId: "skill-1" },
        { id: "fs-2", date: "2026-03-31", durationMin: 30, skillId: "skill-2" },
        { id: "fs-3", date: "2026-03-30", durationMin: 60, skillId: "skill-3" },
      ],
    },
    network: {
      people: [
        {
          id: 1,
          name: "Ali Akbarov",
          username: "aliakbarov",
          job: "Frontend Developer",
          skill: "React",
          streak: 18,
          mutualFriends: 4,
        },
        {
          id: 2,
          name: "Madina Qodirova",
          username: "madinaq",
          job: "Data Analyst",
          skill: "Data Science",
          streak: 22,
          mutualFriends: 7,
        },
        {
          id: 3,
          name: "Jahongir Eshonov",
          username: "jahongires",
          job: "Product Designer",
          skill: "UI/UX",
          streak: 9,
          mutualFriends: 3,
        },
        {
          id: 4,
          name: "Shahzoda Karimova",
          username: "shahzoda",
          job: "Mobile Developer",
          skill: "Flutter",
          streak: 15,
          mutualFriends: 5,
        },
        {
          id: 5,
          name: "Bekzod Tursunov",
          username: "bekzod_ai",
          job: "AI Engineer",
          skill: "ML",
          streak: 27,
          mutualFriends: 2,
        },
        {
          id: 6,
          name: "Nodirbek Rasulov",
          username: "nodirbekrs",
          job: "Backend Engineer",
          skill: "Node.js",
          streak: 12,
          mutualFriends: 6,
        },
      ],
      connectedIds: [2],
      messageLog: {},
    },
    assistant: {
      messages: [
        {
          id: 1,
          role: "assistant",
          text: "Assalomu alaykum. Men sizning shaxsiy produktivlik yordamchingizman.",
        },
      ],
      nextId: 2,
    },
    settings: {
      language: "O'zbek",
      notifications: {
        habits: true,
        goals: true,
        assistant: false,
      },
      integrations: {
        calendar: true,
        smartwatch: false,
        mobileSync: true,
      },
    },
  },
};
