"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const languageOptions = [
  { code: "English", label: "English" },
  { code: "Hindi", label: "हिन्दी" },
  { code: "Marathi", label: "मराठी" },
  { code: "Gujarati", label: "ગુજરાતી" },
  { code: "Bengali", label: "বাংলা" },
] as const;

type Language = (typeof languageOptions)[number]["code"];
type City = "Bengaluru" | "Pune";
type Mode = "discover" | "launch";
type Screen = "home" | "advisor" | "market" | "plan";

type Translation = {
  greeting: string;
  welcome: string;
  welcomeDescription: string;
  chooseCity: string;
  city: string;
  discover: string;
  launch: string;
  profile: string;
  answers: string;
  type: string;
  connection: string;
  rateLimit: string;
  translationError: string;
  sampleNotice: string;
  marketTitle: string;
  marketMessage: string;
  planTitle: string;
  planMessage: string;
  navChat: string;
  navPlan: string;
  navMarket: string;
  navHome: string;
  back: string;
};

const copy: Record<Language, Translation> = {
  English: {
    greeting: "Namaste! I am your city business saathi. What would you like to plan today?",
    welcome: "Welcome to VyaparSaathi City",
    welcomeDescription: "Explore a business idea, compare local opportunities and plan your next steps.",
    chooseCity: "Choose your city",
    city: "City",
    discover: "I need a business idea",
    launch: "I already have an idea",
    profile: "Your planning profile",
    answers: "{complete}/5 key answers",
    type: "Type a message...",
    connection: "Could not reach the advisor. Please try again.",
    rateLimit: "The advisor is busy right now. Please try again in a moment.",
    translationError: "Could not translate the conversation. Your previous language was restored.",
    sampleNotice: "Sample figures are clearly labelled. Check local conditions before making a decision.",
    marketTitle: "Local market",
    marketMessage: "Market data tools are being connected. Until real city datasets are added, figures stay labelled as sample data.",
    planTitle: "My business plan",
    planMessage: "Your answers are saved on this device. Business costs, break-even and launch steps will appear here as you build your plan.",
    navChat: "Saathi",
    navPlan: "My plan",
    navMarket: "Market",
    navHome: "Home",
    back: "Back to home",
  },
  Hindi: {
    greeting: "नमस्ते! मैं आपका शहर का व्यापार साथी हूँ। आज आप किस चीज़ की योजना बनाना चाहते हैं?",
    welcome: "VyaparSaathi City में आपका स्वागत है",
    welcomeDescription: "व्यवसाय का विचार खोजें, स्थानीय अवसरों की तुलना करें और अगले कदम तय करें।",
    chooseCity: "अपना शहर चुनें",
    city: "शहर",
    discover: "मुझे व्यवसाय का विचार चाहिए",
    launch: "मेरे पास व्यवसाय का विचार है",
    profile: "आपकी योजना प्रोफ़ाइल",
    answers: "{complete}/5 ज़रूरी जवाब",
    type: "संदेश लिखें...",
    connection: "सलाहकार से संपर्क नहीं हो पाया। फिर कोशिश करें।",
    rateLimit: "सलाहकार अभी व्यस्त है। कृपया थोड़ी देर बाद कोशिश करें।",
    translationError: "बातचीत का अनुवाद नहीं हो पाया। पिछली भाषा बहाल कर दी गई है।",
    sampleNotice: "नमूना आंकड़े स्पष्ट रूप से बताए गए हैं। निर्णय से पहले स्थानीय स्थिति जांचें।",
    marketTitle: "स्थानीय बाज़ार",
    marketMessage: "स्थानीय बाज़ार के डेटा टूल जोड़े जा रहे हैं। असली शहर का डेटा आने तक आंकड़े नमूना ही रहेंगे।",
    planTitle: "मेरी व्यवसाय योजना",
    planMessage: "आपके जवाब इस डिवाइस पर सेव हैं। लागत, ब्रेक-ईवन और शुरू करने के कदम आपकी योजना बनाते समय यहां दिखेंगे।",
    navChat: "साथी",
    navPlan: "मेरी योजना",
    navMarket: "बाज़ार",
    navHome: "होम",
    back: "होम पर वापस",
  },
  Marathi: {
    greeting: "नमस्कार! मी तुमचा शहरातील व्यवसाय साथी आहे. आज तुम्हाला कशाचे नियोजन करायचे आहे?",
    welcome: "VyaparSaathi City मध्ये आपले स्वागत आहे",
    welcomeDescription: "व्यवसायाची कल्पना शोधा, स्थानिक संधींची तुलना करा आणि पुढील पावले ठरवा.",
    chooseCity: "तुमचे शहर निवडा",
    city: "शहर",
    discover: "मला व्यवसायाची कल्पना हवी आहे",
    launch: "माझ्याकडे व्यवसायाची कल्पना आहे",
    profile: "तुमची नियोजन प्रोफाइल",
    answers: "{complete}/5 महत्त्वाची उत्तरे",
    type: "संदेश लिहा...",
    connection: "सल्लागाराशी संपर्क होऊ शकला नाही. पुन्हा प्रयत्न करा.",
    rateLimit: "सल्लागार सध्या व्यस्त आहे. थोड्या वेळाने पुन्हा प्रयत्न करा.",
    translationError: "संभाषणाचा अनुवाद होऊ शकला नाही. मागील भाषा पुन्हा सुरू केली आहे.",
    sampleNotice: "नमुना आकडे स्पष्टपणे दाखवले आहेत. निर्णयापूर्वी स्थानिक परिस्थिती तपासा.",
    marketTitle: "स्थानिक बाजार",
    marketMessage: "स्थानिक बाजाराची डेटा साधने जोडली जात आहेत. शहराचा खरा डेटा मिळेपर्यंत आकडे नमुना म्हणूनच दाखवले जातील.",
    planTitle: "माझी व्यवसाय योजना",
    planMessage: "तुमची उत्तरे या डिव्हाइसवर जतन केली आहेत. खर्च, ब्रेक-इव्हन आणि सुरुवातीची पावले योजना तयार होताना येथे दिसतील.",
    navChat: "साथी",
    navPlan: "माझी योजना",
    navMarket: "बाजार",
    navHome: "मुख्यपृष्ठ",
    back: "मुख्यपृष्ठावर परत",
  },
  Gujarati: {
    greeting: "નમસ્તે! હું શહેરમાં તમારા વ્યવસાયનો સાથી છું. આજે તમે શું આયોજન કરવા માંગો છો?",
    welcome: "VyaparSaathi City માં તમારું સ્વાગત છે",
    welcomeDescription: "વ્યવસાયનો વિચાર શોધો, સ્થાનિક તકોની તુલના કરો અને આગળનાં પગલાં નક્કી કરો.",
    chooseCity: "તમારું શહેર પસંદ કરો",
    city: "શહેર",
    discover: "મારે વ્યવસાયનો વિચાર જોઈએ છે",
    launch: "મારી પાસે વ્યવસાયનો વિચાર છે",
    profile: "તમારી આયોજન પ્રોફાઇલ",
    answers: "{complete}/5 મહત્ત્વના જવાબો",
    type: "સંદેશ લખો...",
    connection: "સલાહકારનો સંપર્ક થઈ શક્યો નથી. ફરી પ્રયાસ કરો.",
    rateLimit: "સલાહકાર અત્યારે વ્યસ્ત છે. થોડી વાર પછી ફરી પ્રયાસ કરો.",
    translationError: "વાતચીતનો અનુવાદ થઈ શક્યો નથી. અગાઉની ભાષા પુનઃસ્થાપિત કરી છે.",
    sampleNotice: "નમૂનાના આંકડા સ્પષ્ટ રીતે દર્શાવ્યા છે. નિર્ણય પહેલાં સ્થાનિક સ્થિતિ તપાસો.",
    marketTitle: "સ્થાનિક બજાર",
    marketMessage: "સ્થાનિક બજારનાં ડેટા સાધનો જોડાઈ રહ્યાં છે. શહેરનો વાસ્તવિક ડેટા ઉમેરાય ત્યાં સુધી આંકડા નમૂના તરીકે જ રહેશે.",
    planTitle: "મારી વ્યવસાય યોજના",
    planMessage: "તમારા જવાબો આ ઉપકરણ પર સાચવ્યા છે. ખર્ચ, બ્રેક-ઈવન અને શરૂઆતનાં પગલાં તમારી યોજના સાથે અહીં દેખાશે.",
    navChat: "સાથી",
    navPlan: "મારી યોજના",
    navMarket: "બજાર",
    navHome: "હોમ",
    back: "હોમ પર પાછા",
  },
  Bengali: {
    greeting: "নমস্কার! আমি শহরের ব্যবসায় আপনার সাথী। আজ আপনি কী পরিকল্পনা করতে চান?",
    welcome: "VyaparSaathi City-তে আপনাকে স্বাগতম",
    welcomeDescription: "ব্যবসার ধারণা খুঁজুন, স্থানীয় সুযোগ তুলনা করুন এবং পরবর্তী পদক্ষেপ ঠিক করুন।",
    chooseCity: "আপনার শহর বেছে নিন",
    city: "শহর",
    discover: "আমি ব্যবসার ধারণা খুঁজছি",
    launch: "আমার ব্যবসার ধারণা আছে",
    profile: "আপনার পরিকল্পনার প্রোফাইল",
    answers: "{complete}/5টি গুরুত্বপূর্ণ উত্তর",
    type: "একটি বার্তা লিখুন...",
    connection: "পরামর্শদাতার সঙ্গে যোগাযোগ করা যায়নি। আবার চেষ্টা করুন।",
    rateLimit: "পরামর্শদাতা এখন ব্যস্ত। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
    translationError: "কথোপকথন অনুবাদ করা যায়নি। আগের ভাষা ফিরিয়ে দেওয়া হয়েছে।",
    sampleNotice: "নমুনার তথ্য স্পষ্টভাবে চিহ্নিত। সিদ্ধান্তের আগে স্থানীয় পরিস্থিতি যাচাই করুন।",
    marketTitle: "স্থানীয় বাজার",
    marketMessage: "স্থানীয় বাজারের ডেটা টুল যোগ করা হচ্ছে। আসল শহরের ডেটা না আসা পর্যন্ত তথ্য নমুনা হিসেবেই দেখানো হবে।",
    planTitle: "আমার ব্যবসার পরিকল্পনা",
    planMessage: "আপনার উত্তর এই ডিভাইসে সংরক্ষিত। পরিকল্পনা তৈরি হলে খরচ, ব্রেক-ইভেন এবং শুরুর পদক্ষেপ এখানে দেখা যাবে।",
    navChat: "সাথী",
    navPlan: "আমার পরিকল্পনা",
    navMarket: "বাজার",
    navHome: "হোম",
    back: "হোমে ফিরে যান",
  },
};

type ChatMessage = {
  role: "ai" | "user";
  text: string;
  time: string;
};

type UserProfile = {
  language: Language;
  city: City;
  district: string | null;
  available_capital: number | null;
  skills: string[];
  assets: string[];
  working_hours: string | null;
  loan_needed: boolean | null;
};

type VyaparState = {
  user_profile: UserProfile;
  business_context: {
    mode: Mode | null;
    category: string | null;
    business_name: string | null;
    candidate_zones: string[];
    competitor_count: number | null;
    supply_distance_km: number | null;
    daily_input_cost: number | null;
    additional_details: Record<string, unknown>;
  };
  financial_evaluation: {
    total_project_cost: number | null;
    startup_cost: number | null;
    unit_cost: number | null;
    selling_price: number | null;
    fixed_monthly_cost: number | null;
    expected_daily_units: number | null;
    funding_gap: number | null;
    loan_required: boolean | null;
    estimated_monthly_emi: number | null;
    estimated_monthly_profit: number | null;
    break_even_units_per_day: number | null;
  };
};

type ChatResponse = {
  updated_state: VyaparState;
  response_text: string;
};

const storageKey = "vyaparsaathi-city";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function createInitialState(language: Language): VyaparState {
  return {
    user_profile: {
      language,
      city: "Bengaluru",
      district: null,
      available_capital: null,
      skills: [],
      assets: [],
      working_hours: null,
      loan_needed: null,
    },
    business_context: {
      mode: null,
      category: null,
      business_name: null,
      candidate_zones: [],
      competitor_count: null,
      supply_distance_km: null,
      daily_input_cost: null,
      additional_details: {},
    },
    financial_evaluation: {
      total_project_cost: null,
      startup_cost: null,
      unit_cost: null,
      selling_price: null,
      fixed_monthly_cost: null,
      expected_daily_units: null,
      funding_gap: null,
      loan_required: null,
      estimated_monthly_emi: null,
      estimated_monthly_profit: null,
      break_even_units_per_day: null,
    },
  };
}

function isLanguage(value: string): value is Language {
  return languageOptions.some((option) => option.code === value);
}

export default function VyaparSaathiCityApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home");
  const [language, setLanguage] = useState<Language>("English");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", text: copy.English.greeting, time: "" },
  ]);
  const [transcriptCache, setTranscriptCache] = useState<Partial<Record<Language, ChatMessage[]>>>({});
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [languageError, setLanguageError] = useState("");
  const [vyaparState, setVyaparState] = useState<VyaparState>(() => createInitialState("English"));
  const t = copy[language];

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as {
          language?: string;
          activeScreen?: Screen;
          messages?: ChatMessage[];
          vyaparState?: Partial<VyaparState>;
        };
        const savedLanguage = parsed.language && isLanguage(parsed.language) ? parsed.language : "English";
        const initial = createInitialState(savedLanguage);
        const savedProfile = parsed.vyaparState?.user_profile;
        const inferredCity: City = savedProfile?.city
          ?? (savedProfile?.district === "Pune" ? "Pune" : "Bengaluru");
        setLanguage(savedLanguage);
        setVyaparState({
          ...initial,
          ...parsed.vyaparState,
          user_profile: {
            ...initial.user_profile,
            ...savedProfile,
            city: inferredCity,
            language: savedLanguage,
            skills: savedProfile?.skills ?? [],
            assets: savedProfile?.assets ?? [],
          },
          business_context: {
            ...initial.business_context,
            ...parsed.vyaparState?.business_context,
            candidate_zones: parsed.vyaparState?.business_context?.candidate_zones ?? [],
            additional_details: parsed.vyaparState?.business_context?.additional_details ?? {},
          },
          financial_evaluation: {
            ...initial.financial_evaluation,
            ...parsed.vyaparState?.financial_evaluation,
          },
        });
        if (parsed.messages?.length) setMessages(parsed.messages);
        if (parsed.activeScreen && ["home", "advisor", "market", "plan"].includes(parsed.activeScreen)) {
          setActiveScreen(parsed.activeScreen);
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const languageCodes: Record<Language, string> = {
      English: "en",
      Hindi: "hi",
      Marathi: "mr",
      Gujarati: "gu",
      Bengali: "bn",
    };
    document.documentElement.lang = languageCodes[language];
  }, [language]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify({
      language,
      activeScreen,
      messages,
      vyaparState,
    }));
  }, [activeScreen, isHydrated, language, messages, vyaparState]);

  const progress = useMemo(() => {
    const { user_profile: profile, business_context: business } = vyaparState;
    const filled = [
      business.mode === "discover" || Boolean(business.business_name),
      profile.available_capital !== null,
      profile.skills.length > 0,
      business.candidate_zones.length > 0,
      Boolean(profile.working_hours),
    ].filter(Boolean).length;
    return { filled, percent: filled * 20 };
  }, [vyaparState]);

  const chooseMode = (mode: Mode) => {
    setVyaparState((previous) => ({
      ...previous,
      business_context: { ...previous.business_context, mode },
    }));
    setMessages([{ role: "ai", text: t.greeting, time: "" }]);
    setActiveScreen("advisor");
  };

  const changeLanguage = async (nextLanguage: Language) => {
    setLanguageError("");
    if (nextLanguage === language) {
      setIsLanguageMenuOpen(false);
      return;
    }
    const previousLanguage = language;
    setLanguage(nextLanguage);
    setVyaparState((previous) => ({
      ...previous,
      user_profile: { ...previous.user_profile, language: nextLanguage },
    }));
    setTranscriptCache((previous) => ({ ...previous, [previousLanguage]: messages }));
    const cachedTranscript = transcriptCache[nextLanguage];
    if (cachedTranscript) {
      setMessages(cachedTranscript);
      setIsLanguageMenuOpen(false);
      return;
    }

    try {
      const response = await axios.post<{ chat_history: ChatMessage[] }>(
        `${apiBaseUrl}/api/translate-chat`,
        { chat_history: messages, language: nextLanguage },
      );
      const translated = response.data.chat_history;
      if (!Array.isArray(translated) || translated.length !== messages.length ||
        translated.some((message) => typeof message.text !== "string" || !message.text.trim())) {
        throw new Error("The translation response was incomplete");
      }
      setMessages(translated);
      setTranscriptCache((previous) => ({ ...previous, [nextLanguage]: translated }));
    } catch {
      setLanguage(previousLanguage);
      setVyaparState((previous) => ({
        ...previous,
        user_profile: { ...previous.user_profile, language: previousLanguage },
      }));
      setLanguageError(copy[previousLanguage].translationError);
    }
    setIsLanguageMenuOpen(false);
  };

  const sendMessage = async () => {
    const userMessage = inputText.trim();
    if (!userMessage || isLoading) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updatedMessages = [...messages, { role: "user" as const, text: userMessage, time }];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await axios.post<ChatResponse>(`${apiBaseUrl}/api/chat-loop`, {
        state: vyaparState,
        message: userMessage,
        chat_history: messages,
      });
      const assistantMessage: ChatMessage = {
        role: "ai",
        text: response.data.response_text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const completeHistory = [...updatedMessages, assistantMessage];
      setVyaparState(response.data.updated_state);
      setMessages(completeHistory);
      setTranscriptCache({ [language]: completeHistory });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.status === 429
        ? t.rateLimit
        : t.connection;
      setMessages([...updatedMessages, { role: "ai", text: message, time }]);
    } finally {
      setIsLoading(false);
    }
  };

  const TopAppBar = ({ title = "VyaparSaathi City" }: { title?: string }) => (
    <header className="fixed top-0 left-0 right-0 z-50 mx-auto flex h-16 max-w-md items-center justify-between border-b border-outline-variant bg-surface px-4">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary" aria-hidden="true">storefront</span>
        <span className="font-bold">{title}</span>
      </div>
      <div className="relative">
        <button
          type="button"
          aria-label="Change language"
          aria-expanded={isLanguageMenuOpen}
          onClick={() => setIsLanguageMenuOpen((open) => !open)}
          className="material-symbols-outlined rounded-lg p-2 text-primary hover:bg-surface-container"
        >translate</button>
        {isLanguageMenuOpen && (
          <div className="absolute right-0 top-11 z-50 w-36 rounded-xl border border-outline-variant bg-white p-1.5 shadow-xl">
            {languageOptions.map((option) => (
              <button
                type="button"
                key={option.code}
                onClick={() => void changeLanguage(option.code)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${language === option.code ? "bg-primary-container/20 font-bold text-primary" : "text-on-surface hover:bg-surface-container-low"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );

  const BottomNav = () => (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md justify-around rounded-t-2xl bg-white px-3 py-3 pb-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {([
        ["home", "home", t.navHome],
        ["advisor", "forum", t.navChat],
        ["market", "map", t.navMarket],
        ["plan", "assignment", t.navPlan],
      ] as const).map(([screen, icon, label]) => (
        <button
          type="button"
          key={screen}
          onClick={() => setActiveScreen(screen)}
          aria-current={activeScreen === screen ? "page" : undefined}
          className={`flex flex-col items-center rounded-xl px-3 py-1 ${activeScreen === screen ? "bg-primary-container/20 text-primary" : "text-outline"}`}
        >
          <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
          <span className="mt-1 text-[10px] font-semibold">{label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="relative mx-auto min-h-screen max-w-md overflow-hidden bg-surface text-on-surface shadow-2xl">
      {activeScreen === "home" && (
        <div className="min-h-screen px-5 pb-28 pt-24">
          <TopAppBar />
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">VyaparSaathi City</p>
          <h1 className="font-sans text-3xl font-extrabold leading-tight">{t.welcome}</h1>
          <p className="mt-3 text-outline">{t.welcomeDescription}</p>

          <label htmlFor="city-select" className="mb-2 mt-7 block text-sm font-bold">{t.chooseCity}</label>
          <select
            id="city-select"
            value={vyaparState.user_profile.city}
            onChange={(event) => {
              const city = event.target.value as City;
              setVyaparState((previous) => ({
                ...previous,
                user_profile: { ...previous.user_profile, city, district: city },
                business_context: { ...previous.business_context, candidate_zones: [] },
              }));
            }}
            className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3"
          >
            <option value="Bengaluru">Bengaluru</option>
            <option value="Pune">Pune</option>
          </select>

          <section className="mt-6 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm" aria-labelledby="profile-progress-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="profile-progress-title" className="font-bold">{t.profile}</h2>
              <span className="text-xs font-semibold text-outline">{t.answers.replace("{complete}", String(progress.filled))}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-highest">
              <div className="h-full bg-primary-container transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
          </section>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => chooseMode("discover")}
              className="flex min-h-20 items-center justify-between rounded-2xl bg-primary px-5 py-4 text-left font-bold text-white shadow-md transition hover:opacity-90"
            >
              <span>{t.discover}</span>
              <span className="material-symbols-outlined" aria-hidden="true">lightbulb</span>
            </button>
            <button
              type="button"
              onClick={() => chooseMode("launch")}
              className="flex min-h-20 items-center justify-between rounded-2xl border-2 border-primary bg-white px-5 py-4 text-left font-bold text-primary transition hover:bg-primary/5"
            >
              <span>{t.launch}</span>
              <span className="material-symbols-outlined" aria-hidden="true">rocket_launch</span>
            </button>
          </div>

          <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{t.sampleNotice}</p>
          <BottomNav />
        </div>
      )}

      {activeScreen === "advisor" && (
        <div className="flex h-screen flex-col">
          <TopAppBar />
          <div className="fixed left-0 right-0 top-16 z-40 mx-auto flex max-w-md items-center gap-4 bg-surface px-4 py-3">
            <span className="whitespace-nowrap text-xs font-semibold text-outline">{t.profile} {progress.percent}%</span>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
              <div className="h-full bg-primary-container transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
          <main className="mt-[112px] mb-[160px] flex-1 space-y-4 overflow-y-auto px-4 py-3">
            {languageError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{languageError}</p>}
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex max-w-[88%] flex-col ${message.role === "user" ? "ml-auto items-end" : "items-start"}`}>
                <div className={`rounded-2xl p-4 shadow-sm ${message.role === "user" ? "rounded-br-sm bg-surface-container" : "rounded-bl-sm border border-outline-variant/40 bg-white"}`}>
                  <p className="text-[15px]">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && <p className="text-sm text-outline" role="status">…</p>}
          </main>
          <div className="fixed bottom-[76px] left-0 right-0 z-40 mx-auto max-w-md border-t border-outline-variant/30 bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <input
                className="min-w-0 flex-1 rounded-xl border-2 border-outline-variant bg-white px-4 py-3 outline-none focus:border-primary"
                placeholder={t.type}
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void sendMessage();
                }}
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={isLoading || !inputText.trim()}
                aria-label={isLoading ? "Waiting for response" : "Send message"}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined" aria-hidden="true">send</span>
              </button>
            </div>
          </div>
          <BottomNav />
        </div>
      )}

      {activeScreen === "market" && (
        <div className="min-h-screen px-5 pb-28 pt-24">
          <TopAppBar title={t.marketTitle} />
          <div className="mt-8 rounded-2xl border border-outline-variant/50 bg-white p-5 shadow-sm">
            <span className="material-symbols-outlined mb-3 text-4xl text-primary" aria-hidden="true">location_city</span>
            <h1 className="text-xl font-bold">{t.marketTitle}</h1>
            <p className="mt-3 text-sm leading-relaxed text-outline">{t.marketMessage}</p>
          </div>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{t.sampleNotice}</p>
          <BottomNav />
        </div>
      )}

      {activeScreen === "plan" && (
        <div className="min-h-screen px-5 pb-28 pt-24">
          <TopAppBar title={t.planTitle} />
          <section className="mt-8 rounded-2xl border border-outline-variant/50 bg-white p-5 shadow-sm">
            <h1 className="text-xl font-bold">{t.planTitle}</h1>
            <p className="mt-3 text-sm leading-relaxed text-outline">{t.planMessage}</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt>{t.city}</dt><dd className="font-semibold">{vyaparState.user_profile.city}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{t.profile}</dt><dd className="font-semibold">{progress.percent}%</dd>
              </div>
            </dl>
          </section>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{t.sampleNotice}</p>
          <BottomNav />
        </div>
      )}
    </div>
  );
}
