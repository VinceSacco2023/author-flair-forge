import type { Question } from "./types";

export const SURVEY_TITLE = "What Will I Do All Day?";
export const SURVEY_SUBTITLE = "A survey about life after work";

export const SURVEY_INTRO = [
  "This takes about four minutes.",
  "There are no right answers, and none of this is about money. I am writing a book about what people actually do after they stop working, and I need real answers from real people.",
  "Everything is anonymous unless you choose to leave your email at the end. Answers may be quoted anonymously in the book. Skip any question you would rather not answer.",
];

export const PARTS = [
  "Part 1 — Where you are",
  "Part 2 — The big two",
  "Part 3 — The hard ones",
  "Part 4 — Work, money and help",
  "Part 5 — How it feels",
  "Part 6 — About you",
] as const;

export const questions: Question[] = [
  {
    id: "stage",
    number: 1,
    part: PARTS[0],
    kind: "single",
    title: "Where are you in the retirement process?",
    help: "Choose one",
    choices: [
      { id: "retired_2plus", label: "Retired more than two years ago" },
      { id: "retired_recent", label: "Retired within the last two years" },
      { id: "retiring_12m", label: "Retiring within the next 12 months" },
      { id: "retiring_1_5y", label: "Retiring in one to five years" },
      { id: "more_than_5y", label: "More than five years away" },
      { id: "never_fully", label: "I don't plan to fully retire" },
    ],
  },
  {
    id: "work_type",
    number: 2,
    part: PARTS[0],
    kind: "single",
    title: "What kind of work did you do — or do you still do?",
    help: "Choose one",
    choices: [
      { id: "trade", label: "Skilled trade or manufacturing" },
      { id: "healthcare", label: "Healthcare" },
      { id: "education", label: "Education" },
      { id: "office", label: "Office, admin or professional services" },
      { id: "management", label: "Management or executive" },
      { id: "transport", label: "Transport, logistics or driving" },
      { id: "public_sector", label: "Public sector, military or emergency services" },
      { id: "self_employed", label: "Self-employed or business owner" },
      { id: "other", label: "Other", allowsText: true },
    ],
  },
  {
    id: "bigger_worry",
    number: 3,
    part: PARTS[1],
    kind: "single",
    title: "Which worries you more?",
    help: "Choose one",
    choices: [
      { id: "money", label: "Running out of money" },
      { id: "things_to_do", label: "Running out of things to do" },
      { id: "both", label: "Both equally" },
      { id: "neither", label: "Neither — I feel ready" },
    ],
  },
  {
    id: "normal_tuesday",
    number: 4,
    part: PARTS[1],
    kind: "single",
    title:
      "Can you describe what a normal Tuesday will look like six months after you retire?",
    help: "Choose one",
    choices: [
      { id: "hour_by_hour", label: "Yes — clearly, hour by hour" },
      { id: "roughly", label: "Roughly, in general terms" },
      { id: "not_really", label: "Not really" },
      { id: "no_idea", label: "No idea at all" },
    ],
  },
  {
    id: "good_at",
    number: 5,
    part: PARTS[2],
    kind: "text",
    title: "What are you good at?",
    help: "Anything at all — from work or outside it. Write as much or as little as you like.",
    placeholder: "The things people ask you for, the things that come easily…",
    rows: 6,
  },
  {
    id: "love_doing",
    number: 6,
    part: PARTS[2],
    kind: "text",
    title: "What do you love doing?",
    placeholder: "The parts of a day you would not want to give up…",
    rows: 6,
  },
  {
    id: "never_again",
    number: 7,
    part: PARTS[2],
    kind: "multi",
    title: "What is the one thing about work you never want to do again?",
    help: "Tick all that apply",
    exclusiveChoiceIds: ["liked_job"],
    choices: [
      { id: "early_mornings", label: "Early mornings" },
      { id: "late_nights", label: "Late nights or shift work" },
      { id: "commuting", label: "Commuting" },
      { id: "travel", label: "Travel" },
      { id: "managing_people", label: "Managing people" },
      { id: "deadlines", label: "Deadlines and pressure" },
      { id: "meetings", label: "Meetings" },
      { id: "on_call", label: "Being on call" },
      { id: "physical_strain", label: "Physical strain" },
      { id: "office_politics", label: "Office politics" },
      { id: "liked_job", label: "Nothing — I liked my job" },
      { id: "other", label: "Other", allowsText: true },
    ],
  },
  {
    id: "earn_money",
    number: 8,
    part: PARTS[3],
    kind: "single",
    title: "Do you want to earn money after you retire?",
    help: "Choose one",
    choices: [
      { id: "need_income", label: "Yes — I need real income" },
      { id: "supplemental", label: "Yes — but only supplemental, no pressure" },
      { id: "if_it_pays", label: "Only if it happens to pay" },
      { id: "done_earning", label: "No — I'm done earning" },
      { id: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "hours_week",
    number: 9,
    part: PARTS[3],
    kind: "single",
    title: "How many hours a week would you want to work, if any?",
    help: "Choose one",
    choices: [
      { id: "none", label: "None" },
      { id: "under_5", label: "Under 5" },
      { id: "5_10", label: "5 to 10" },
      { id: "10_20", label: "10 to 20" },
      { id: "20_30", label: "20 to 30" },
      { id: "30_plus", label: "More than 30" },
    ],
  },
  {
    id: "talked_to",
    number: 10,
    part: PARTS[3],
    kind: "multi",
    title:
      "Who have you talked to about what you'll do with your time — not the money side?",
    help: "Tick all that apply",
    exclusiveChoiceIds: ["nobody"],
    choices: [
      { id: "spouse", label: "My spouse or partner" },
      { id: "friends", label: "Friends" },
      { id: "adviser", label: "My financial adviser" },
      { id: "employer", label: "My employer or HR" },
      { id: "coach", label: "A coach or counsellor" },
      { id: "nobody", label: "Nobody" },
    ],
  },
  {
    id: "tried",
    number: 11,
    part: PARTS[3],
    kind: "multi",
    title: "Have you tried anything to figure this out?",
    help: "Tick all that apply",
    exclusiveChoiceIds: ["nothing_yet"],
    choices: [
      { id: "read_book", label: "Read a book about retirement" },
      { id: "employer_programme", label: "Employer pre-retirement programme" },
      { id: "hired_coach", label: "Hired a coach" },
      { id: "online_quizzes", label: "Online quizzes or frameworks" },
      { id: "talked_family", label: "Talked it through with family" },
      { id: "nothing_yet", label: "Nothing yet" },
    ],
  },
  {
    id: "first_year_worry",
    number: 12,
    part: PARTS[4],
    kind: "text",
    title: "What worries you most about the first year?",
    placeholder: "Say it plainly — this is the part the book is really about…",
    rows: 8,
  },
  {
    id: "confidence",
    number: 13,
    part: PARTS[4],
    kind: "scale",
    title: "How confident are you that you'll enjoy retirement?",
    min: 1,
    max: 5,
    minLabel: "Not at all confident",
    maxLabel: "Completely confident",
  },
  {
    id: "about_you",
    number: 14,
    part: PARTS[5],
    kind: "details",
    title: "A few details",
    help: "All optional.",
  },
  {
    id: "contact",
    number: 15,
    part: PARTS[5],
    kind: "contact",
    title: "Would you like a free personalised plan?",
    help: "Leave your email and I'll send you one. Your email will only be used for this and nothing else.",
    consentLabel:
      "Yes, you may contact me about this survey and the free plan.",
  },
];

export const CLOSING_NOTE =
  "Thank you. That is the whole survey. If you know someone else retiring in the next year or two, please pass this on. The more people who answer, the more useful the results will be for everyone.";

export function questionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}
