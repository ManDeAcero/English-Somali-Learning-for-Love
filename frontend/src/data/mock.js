// Mock data for Somali language learning app

export const TIERS = [
  { id: 1, name: 'Soo Booqo Starter', unlocked: true, color: 'bg-green-500' },
  { id: 2, name: 'Salaan Smooth', unlocked: true, color: 'bg-blue-500' },
  { id: 3, name: 'Wadahadal Wizard', unlocked: true, color: 'bg-purple-500' },
  { id: 4, name: 'Jacayl Journey', unlocked: false, color: 'bg-pink-500' },
  { id: 5, name: 'Smooth Talker Pro', unlocked: false, color: 'bg-orange-500' },
];

export const CATEGORIES = [
  { id: 'basic', name: 'Asaasiga', icon: '🌟' },
  { id: 'greetings', name: 'Salaan', icon: '👋' },
  { id: 'cute_tease', name: 'Cute Tease', icon: '😊' },
  { id: 'compliments', name: 'Bogaadin', icon: '💝' },
  { id: 'deep_talk', name: 'Deep Talk', icon: '💭' },
];

export const MOCK_WORDS = [
  // Tier 1: Soo Booqo Starter
  {
    id: 1,
    somali: 'Salam alaykum',
    english: 'Peace be upon you',
    phonetic: 'sah-LAHM ah-LAY-koom',
    category: 'greetings',
    tier: 1,
    example: 'Salam alaykum, iska warran?',
    exampleEng: 'Peace be upon you, how are you?',
    culturalTip: 'DO: Use this as the most respectful greeting, especially with elders.',
    difficulty: 'beginner',
    isFavorite: false,
    tags: ['respectful', 'religious', 'universal'],
    points: 10
  },
  {
    id: 2,
    somali: 'Iska warran',
    english: 'How are you?',
    phonetic: 'IS-kah WAH-ran',
    category: 'greetings',
    tier: 1,
    example: 'Iska warran walaal?',
    exampleEng: 'How are you, brother/sister?',
    culturalTip: 'DO: Use this casually with friends and peers.',
    difficulty: 'beginner',
    isFavorite: true,
    tags: ['casual', 'friendly'],
    points: 10
  },
  {
    id: 3,
    somali: 'Waan fiicnahay',
    english: 'I am fine',
    phonetic: 'wahn FEE-chah-nah-high',
    category: 'basic',
    tier: 1,
    example: 'Waan fiicnahay, mahadsanid.',
    exampleEng: 'I am fine, thank you.',
    culturalTip: 'DO: Standard response to greetings.',
    difficulty: 'beginner',
    isFavorite: false,
    tags: ['response', 'polite'],
    points: 10
  },
  {
    id: 4,
    somali: 'Mahadsanid',
    english: 'Thank you',
    phonetic: 'mah-had-SAH-nid',
    category: 'basic',
    tier: 1,
    example: 'Mahadsanid, waa ku mahadsan tahay.',
    exampleEng: 'Thank you, I am grateful to you.',
    culturalTip: 'DO: Always acknowledge kindness with gratitude.',
    difficulty: 'beginner',
    isFavorite: false,
    tags: ['gratitude', 'polite'],
    points: 10
  },
  {
    id: 5,
    somali: 'Waa ku mahadsan tahay',
    english: 'You\'re welcome',
    phonetic: 'wah-koo mah-had-SAHN tah-high',
    category: 'basic',
    tier: 1,
    example: 'Waa ku mahadsan tahay walaal.',
    exampleEng: 'You\'re welcome, brother/sister.',
    culturalTip: 'DO: Use to respond to thanks graciously.',
    difficulty: 'beginner',
    isFavorite: false,
    tags: ['response', 'polite'],
    points: 10
  },

  // Tier 2: Salaan Smooth
  {
    id: 6,
    somali: 'Qurux badan',
    english: 'Very beautiful',
    phonetic: 'KOO-rook BAH-dan',
    category: 'compliments',
    tier: 2,
    example: 'Waa qurux badan tahay.',
    exampleEng: 'You are very beautiful.',
    culturalTip: 'DON\'T: Use too directly with strangers; build rapport first.',
    difficulty: 'intermediate',
    isFavorite: false,
    tags: ['compliment', 'appearance'],
    points: 15
  },
  {
    id: 7,
    somali: 'Cod macaan',
    english: 'Sweet voice',
    phonetic: 'cod mah-CAHN',
    category: 'compliments',
    tier: 2,
    example: 'Cod macaan baad leedahay.',
    exampleEng: 'You have a sweet voice.',
    culturalTip: 'DO: Great compliment for singers or during conversations.',
    difficulty: 'intermediate',
    isFavorite: true,
    tags: ['compliment', 'voice'],
    points: 15
  },
  {
    id: 8,
    somali: 'Indho qurux leh',
    english: 'Beautiful eyes',
    phonetic: 'IN-dho KOO-rook leh',
    category: 'compliments',
    tier: 2,
    example: 'Indho qurux leh baad leedahay.',
    exampleEng: 'You have beautiful eyes.',
    culturalTip: 'DON\'T: Use unless you know the person well; can be too intimate.',
    difficulty: 'intermediate',
    isFavorite: false,
    tags: ['compliment', 'appearance', 'intimate'],
    points: 15
  },
  {
    id: 9,
    somali: 'Waxaad tahay mid xiise leh',
    english: 'You are interesting',
    phonetic: 'wah-SAHD tah-high mid HEE-seh leh',
    category: 'compliments',
    tier: 2,
    example: 'Waxaad tahay mid xiise leh oo wanaagsan.',
    exampleEng: 'You are interesting and good.',
    culturalTip: 'DO: Perfect for showing genuine interest in someone\'s personality.',
    difficulty: 'intermediate',
    isFavorite: false,
    tags: ['compliment', 'personality'],
    points: 15
  },
  {
    id: 10,
    somali: 'Miyaad i jeceshahay?',
    english: 'Do you love me?',
    phonetic: 'mee-YAHD ee jeh-cheh-shah-high',
    category: 'cute_tease',
    tier: 2,
    example: 'Miyaad i jeceshahay mise waa riyaan?',
    exampleEng: 'Do you love me or is it a dream?',
    culturalTip: 'DON\'T: Use too early in relationships; can be overwhelming.',
    difficulty: 'intermediate',
    isFavorite: false,
    tags: ['question', 'romantic', 'direct'],
    points: 20
  },

  // Tier 3: Wadahadal Wizard
  {
    id: 11,
    somali: 'Waan ku jeclahay',
    english: 'I love you',
    phonetic: 'wahn koo jeh-clah-high',
    category: 'deep_talk',
    tier: 3,
    example: 'Waan ku jeclahay inta qalbigayga ku jirto.',
    exampleEng: 'I love you with all my heart.',
    culturalTip: 'DO: Only use when you truly mean it; very serious declaration.',
    difficulty: 'advanced',
    isFavorite: true,
    tags: ['romantic', 'serious', 'emotional'],
    points: 25
  },
  {
    id: 12,
    somali: 'Qalbigayga waa adiga',
    english: 'You are my heart',
    phonetic: 'kal-bee-GAH-gah wah AH-dee-gah',
    category: 'deep_talk',
    tier: 3,
    example: 'Qalbigayga waa adiga, weligaaba.',
    exampleEng: 'You are my heart, always.',
    culturalTip: 'DO: Use for deep romantic expressions; very poetic.',
    difficulty: 'advanced',
    isFavorite: false,
    tags: ['romantic', 'poetic', 'heart'],
    points: 25
  },
  {
    id: 13,
    somali: 'Ma i jeceshahay?',
    english: 'Do you love me?',
    phonetic: 'mah ee jeh-cheh-shah-high',
    category: 'cute_tease',
    tier: 3,
    example: 'Ma i jeceshahay sida aan ku jeclahay?',
    exampleEng: 'Do you love me the way I love you?',
    culturalTip: 'DON\'T: Ask repeatedly; shows insecurity.',
    difficulty: 'advanced',
    isFavorite: false,
    tags: ['question', 'romantic', 'vulnerable'],
    points: 20
  },
  {
    id: 14,
    somali: 'Indhahaaga way i helayaan',
    english: 'Your eyes find me',
    phonetic: 'in-DAH-hah-gah why ee heh-LAH-yahn',
    category: 'compliments',
    tier: 3,
    example: 'Indhahaaga way i helayaan xitaa meelaha mugdiga ah.',
    exampleEng: 'Your eyes find me even in dark places.',
    culturalTip: 'DO: Very poetic; use for artistic romantic expression.',
    difficulty: 'advanced',
    isFavorite: false,
    tags: ['poetic', 'romantic', 'eyes'],
    points: 25
  },
  {
    id: 15,
    somali: 'Waa kugu dhamaystay',
    english: 'I am finished because of you',
    phonetic: 'wah koo-goo dah-MAH-ees-tay',
    category: 'cute_tease',
    tier: 3,
    example: 'Waa kugu dhamaystay, maxaad i samaysay?',
    exampleEng: 'I am finished because of you, what have you done to me?',
    culturalTip: 'DO: Playful way to say someone has completely won you over.',
    difficulty: 'advanced',
    isFavorite: false,
    tags: ['playful', 'dramatic', 'romantic'],
    points: 20
  }
];

export const MOCK_USER_PROGRESS = {
  level: 3,
  totalPoints: 285,
  streak: 7,
  badges: [
    { id: 'first_word', name: 'First Word', icon: '🎯', earned: true },
    { id: 'week_streak', name: 'Week Warrior', icon: '🔥', earned: true },
    { id: 'compliment_king', name: 'Compliment King', icon: '👑', earned: false }
  ],
  unlockedTiers: [1, 2, 3],
  completedWords: [1, 2, 3, 4, 5, 6, 7, 8],
  favorites: [2, 7, 11]
};

// Mock audio generation function
export const generateMockAudio = (text, speed = 'normal') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In real app, this would be actual audio from TTS API
      resolve(`data:audio/mp3;base64,mock-audio-${text.replace(/\s+/g, '-')}-${speed}`);
    }, 1000);
  });
};