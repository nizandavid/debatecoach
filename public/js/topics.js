// topics.js - Comprehensive debate topics database
// 100+ topics organized by category

export const DEBATE_TOPICS = {
  
  // 🌍 Society & Politics (20 topics)
  society: [
    "Voting should be mandatory in all democratic countries",
    "The death penalty should be abolished worldwide",
    "Hate speech laws are necessary to protect minorities",
    "Universal basic income is the solution to poverty",
    "Whistleblowers like Snowden are heroes, not traitors",
    "National borders should be abolished for a unified world",
    "Jury trials are superior to judge-only trials",
    "Political parties do more harm than good to democracy",
    "The voting age should be lowered to 16",
    "Censorship is never justified in a free society",
    "Term limits should be mandatory for all politicians",
    "Democracy is the best form of government",
    "Governments should regulate fake news on social media",
    "Protest movements are essential for social progress",
    "Mandatory military service builds better citizens",
    "Immigration strengthens rather than weakens nations",
    "Direct democracy is superior to representative democracy",
    "Privacy rights should override national security concerns",
    "Civil disobedience is justified when laws are unjust",
    "Nationalism does more harm than good in the modern world"
  ],
  
  // 💻 Technology & AI (20 topics)
  technology: [
    "Artificial intelligence poses more risks than benefits",
    "Social media platforms should be regulated by governments",
    "Encryption backdoors should be mandatory for law enforcement",
    "AI-generated content should require disclosure labels",
    "Autonomous weapons should be banned internationally",
    "Personal data is the new oil and should be treated as property",
    "Facial recognition technology violates privacy rights",
    "Video games cause real-world violence",
    "Screen time limits should be enforced by law for minors",
    "The internet has made people less intelligent",
    "Cryptocurrency will replace traditional currency",
    "Self-driving cars will save more lives than they endanger",
    "Big Tech companies should be broken up",
    "Deepfake technology should be banned entirely",
    "Online anonymity does more harm than good",
    "Smartphones have destroyed face-to-face communication",
    "Governments should provide internet access as a human right",
    "Digital surveillance is necessary to prevent terrorism",
    "Gene editing technology (CRISPR) should be freely available",
    "Virtual reality will replace real-world experiences"
  ],
  
  // 🎓 Education (15 topics)
  education: [
    "University education should be free for all students",
    "Standardized testing does not measure true intelligence",
    "Schools should teach coding from elementary level",
    "Traditional lectures are outdated in modern education",
    "Homework does more harm than good",
    "Students should grade their teachers",
    "Physical education should be optional in high schools",
    "Single-sex schools provide better learning environments",
    "Gap years should be mandatory before university",
    "Online learning is as effective as in-person classes",
    "Arts education is as important as STEM subjects",
    "Schools should teach life skills over academic subjects",
    "Class attendance should not be mandatory at universities",
    "Competitive grading hurts student learning",
    "Foreign language learning should start in kindergarten"
  ],
  
  // 🌱 Environment & Climate (15 topics)
  environment: [
    "Climate change is the most pressing issue of our time",
    "Nuclear energy is the solution to climate change",
    "Plastic should be banned entirely",
    "Capitalism cannot solve the climate crisis",
    "Individual action is pointless against climate change",
    "Countries should accept climate refugees",
    "Animal agriculture is worse for the environment than cars",
    "Carbon taxes are the best way to fight climate change",
    "Space colonization is necessary for human survival",
    "Renewable energy can replace fossil fuels completely",
    "Overpopulation is the root cause of environmental problems",
    "Developed nations owe climate reparations to developing ones",
    "Geoengineering is too dangerous to attempt",
    "Electric vehicles are not the solution to pollution",
    "Zero-waste living should be legally enforced"
  ],
  
  // 💰 Economics & Business (15 topics)
  economics: [
    "Capitalism is superior to socialism",
    "Billionaires should not exist in a fair society",
    "The minimum wage should be a living wage",
    "Universal healthcare is a human right",
    "Labor unions are still relevant in modern economies",
    "Globalization has done more harm than good",
    "The gender pay gap is a myth",
    "Inheritance tax should be 100%",
    "Automation will create more jobs than it destroys",
    "Corporate tax rates are too high",
    "The gig economy exploits workers",
    "Free market capitalism solves inequality",
    "Advertising manipulates consumers and should be regulated",
    "Wealth inequality is necessary for economic growth",
    "Remote work is the future of employment"
  ],
  
  // 🏥 Health & Science (15 topics)
  health: [
    "Genetic engineering of humans should be allowed",
    "Vaccine mandates are ethical and necessary",
    "Alternative medicine is not real medicine",
    "Organ donation should be opt-out by default",
    "Euthanasia should be legal everywhere",
    "Animal testing is necessary for medical progress",
    "Mental health is as important as physical health",
    "Sugar should be regulated like tobacco",
    "Performance-enhancing drugs should be allowed in sports",
    "Healthcare should be rationed based on lifestyle choices",
    "Cloning humans for medical purposes is ethical",
    "Marijuana should be legalized for medical and recreational use",
    "The obesity epidemic is a personal responsibility issue",
    "Telemedicine can replace in-person doctor visits",
    "Pharmaceutical companies prioritize profit over health"
  ],
  
  // 🎭 Culture & Media (10 topics)
  culture: [
    "Cancel culture is harmful to free speech",
    "Cultural appropriation is a form of theft",
    "Reality TV does more harm than good",
    "Violent movies and games desensitize people to violence",
    "Celebrity culture is toxic for society",
    "Art should never be censored, regardless of content",
    "Professional sports players are overpaid",
    "Museums should return all stolen artifacts",
    "Music streaming services exploit artists",
    "Social media influencers are not real jobs"
  ]
};

// Flatten all topics into one array
export const ALL_TOPICS = Object.values(DEBATE_TOPICS).flat();

// Get all categories
export const CATEGORIES = {
  all: "All Topics",
  society: "Society & Politics",
  technology: "Technology & AI", 
  education: "Education",
  environment: "Environment & Climate",
  economics: "Economics & Business",
  health: "Health & Science",
  culture: "Culture & Media"
};

// Get random topic from specific category or all
export function getRandomTopic(category = 'all') {
  if (category === 'all') {
    return ALL_TOPICS[Math.floor(Math.random() * ALL_TOPICS.length)];
  }
  
  const categoryTopics = DEBATE_TOPICS[category];
  if (!categoryTopics || categoryTopics.length === 0) {
    // Fallback to all topics if category not found
    return ALL_TOPICS[Math.floor(Math.random() * ALL_TOPICS.length)];
  }
  
  return categoryTopics[Math.floor(Math.random() * categoryTopics.length)];
}

// Get topics by category
export function getTopicsByCategory(category) {
  if (category === 'all') {
    return ALL_TOPICS;
  }
  return DEBATE_TOPICS[category] || [];
}

// Count topics
export function getTopicsCount() {
  return {
    total: ALL_TOPICS.length,
    society: DEBATE_TOPICS.society.length,
    technology: DEBATE_TOPICS.technology.length,
    education: DEBATE_TOPICS.education.length,
    environment: DEBATE_TOPICS.environment.length,
    economics: DEBATE_TOPICS.economics.length,
    health: DEBATE_TOPICS.health.length,
    culture: DEBATE_TOPICS.culture.length
  };
}

console.log('✅ Topics loaded:', getTopicsCount());
