"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const languageOptions = [
  { code: "English", label: "English" },
  { code: "Hindi", label: "हिन्दी" },
  { code: "Marathi", label: "मराठी" },
  { code: "Gujarati", label: "ગુજરાતી" },
  { code: "Bengali", label: "বাংলা" }
] as const;

const copy = {
  English: {
    greeting: "Namaste! I am VyaparSaathi. How can I help you grow your business today?",
    welcome: "Welcome to VyaparSaathi",
    welcomeDescription: "Set up your profile to discover localized business opportunities.",
    start: "Start My Business Journey",
    profile: "Profile",
    type: "Type a message...",
    connection: "Connection error. Please try again.",
    rateLimit: "The assistant is busy right now. Please try again in a moment.",
    loan: "View Loan Options",
    documents: "Mandatory MoSJE Documents",
    market: "Market Map",
    comingSoon: "Live Traffic Map Coming Soon",
    navChat: "Chat",
    navInsights: "Insights",
    navMarket: "Market",
    navProfile: "Profile",
    totalRequirement: "Total Project Requirement", margin: "Your 10% Margin", loanAmount: "SCA Loan", repayment: "Estimated Monthly Repayment", repaymentNote: "Payable over 33 active months after a 3-month grace period at 6.5% p.a.", roadmap: "Generate 7-Day Action Roadmap", documentsList: ["Aadhaar Card (Linked to Mobile)", "Target Group / Category Certificate", "Local Residence Proof"]
  },
  Hindi: {
    greeting: "नमस्ते! मैं व्यापारसाथी हूँ। आज मैं आपके व्यापार को बढ़ाने में कैसे मदद कर सकता हूँ?",
    welcome: "VyaparSaathi में आपका स्वागत है",
    welcomeDescription: "स्थानीय व्यापार के अवसर खोजने के लिए अपनी प्रोफ़ाइल तैयार करें।",
    start: "अपना व्यापार शुरू करें",
    profile: "प्रोफ़ाइल",
    type: "संदेश लिखें...",
    connection: "कनेक्शन में समस्या। फिर कोशिश करें।",
    rateLimit: "अभी सहायक व्यस्त है। कृपया थोड़ी देर बाद फिर कोशिश करें।",
    loan: "ऋण विकल्प देखें",
    documents: "MoSJE के आवश्यक दस्तावेज़",
    market: "बाज़ार का नक्शा",
    comingSoon: "लाइव ट्रैफिक मैप जल्द आ रहा है",
    navChat: "चैट",
    navInsights: "इनसाइट्स",
    navMarket: "बाज़ार",
    navProfile: "प्रोफ़ाइल", totalRequirement: "कुल परियोजना आवश्यकता", margin: "आपका 10% मार्जिन", loanAmount: "एससीए ऋण", repayment: "अनुमानित मासिक किस्त", repaymentNote: "3 महीने की रियायत अवधि के बाद 6.5% वार्षिक ब्याज पर 33 महीनों में भुगतान।", roadmap: "7-दिन की कार्य योजना बनाएं", documentsList: ["आधार कार्ड (मोबाइल से लिंक)", "लक्षित समूह / श्रेणी प्रमाणपत्र", "स्थानीय निवास प्रमाण"]
  },
  Marathi: {
    greeting: "नमस्कार! मी व्यापारसाथी आहे. आज तुमचा व्यवसाय वाढवण्यासाठी मी कशी मदत करू शकतो?",
    welcome: "VyaparSaathi मध्ये आपले स्वागत आहे",
    welcomeDescription: "स्थानिक व्यवसायाच्या संधी शोधण्यासाठी आपले प्रोफाइल तयार करा.",
    start: "माझा व्यवसाय प्रवास सुरू करा",
    profile: "प्रोफाइल",
    type: "संदेश लिहा...",
    connection: "कनेक्शनमध्ये समस्या. पुन्हा प्रयत्न करा.",
    rateLimit: "सहाय्यक सध्या व्यस्त आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.",
    loan: "कर्जाचे पर्याय पहा",
    documents: "MoSJE आवश्यक कागदपत्रे",
    market: "बाजाराचा नकाशा",
    comingSoon: "लाइव्ह ट्रॅफिक नकाशा लवकरच येत आहे",
    navChat: "चॅट",
    navInsights: "माहिती",
    navMarket: "बाजार",
    navProfile: "प्रोफाइल", totalRequirement: "एकूण प्रकल्प आवश्यकता", margin: "तुमचा 10% मार्जिन", loanAmount: "एससीए कर्ज", repayment: "अंदाजे मासिक परतफेड", repaymentNote: "3 महिन्यांच्या सवलत कालावधीनंतर 6.5% वार्षिक दराने 33 महिन्यांत परतफेड.", roadmap: "7 दिवसांचा कृती आराखडा तयार करा", documentsList: ["आधार कार्ड (मोबाइलशी जोडलेले)", "लक्षित गट / श्रेणी प्रमाणपत्र", "स्थानिक रहिवासी पुरावा"]
  },
  Gujarati: {
    greeting: "નમસ્તે! હું વેપારસાથી છું. આજે તમારો વ્યવસાય વધારવામાં હું કેવી રીતે મદદ કરી શકું?",
    welcome: "VyaparSaathi માં તમારું સ્વાગત છે",
    welcomeDescription: "સ્થાનિક વ્યવસાયની તકો શોધવા માટે તમારી પ્રોફાઇલ સેટ કરો.",
    start: "મારી વ્યવસાય યાત્રા શરૂ કરો",
    profile: "પ્રોફાઇલ",
    type: "સંદેશ લખો...",
    connection: "કનેક્શનમાં ભૂલ. ફરી પ્રયાસ કરો.",
    rateLimit: "સહાયક અત્યારે વ્યસ્ત છે. કૃપા કરીને થોડી વાર પછી ફરી પ્રયાસ કરો.",
    loan: "લોન વિકલ્પો જુઓ",
    documents: "MoSJE ફરજિયાત દસ્તાવેજો",
    market: "બજારનો નકશો",
    comingSoon: "લાઇવ ટ્રાફિક નકશો ટૂંક સમયમાં આવી રહ્યો છે",
    navChat: "ચેટ",
    navInsights: "માહિતી",
    navMarket: "બજાર",
    navProfile: "પ્રોફાઇલ", totalRequirement: "કુલ પ્રોજેક્ટ જરૂરિયાત", margin: "તમારું 10% માર્જિન", loanAmount: "SCA લોન", repayment: "અંદાજિત માસિક હપ્તો", repaymentNote: "3 મહિનાની રાહત અવધિ પછી 6.5% વાર્ષિક દરે 33 મહિનામાં ચૂકવણી.", roadmap: "7 દિવસનો કાર્ય રોડમેપ બનાવો", documentsList: ["આધાર કાર્ડ (મોબાઇલ સાથે લિંક થયેલ)", "લક્ષિત જૂથ / શ્રેણી પ્રમાણપત્ર", "સ્થાનિક રહેઠાણનો પુરાવો"]
  },
  Bengali: {
    greeting: "নমস্কার! আমি ব্যবসাসাথী। আজ আপনার ব্যবসা বাড়াতে কীভাবে সাহায্য করতে পারি?",
    welcome: "VyaparSaathi তে আপনাকে স্বাগতম",
    welcomeDescription: "স্থানীয় ব্যবসার সুযোগ খুঁজতে আপনার প্রোফাইল সেট আপ করুন।",
    start: "আমার ব্যবসার যাত্রা শুরু করুন",
    profile: "প্রোফাইল",
    type: "একটি বার্তা টাইপ করুন...",
    connection: "সংযোগ ত্রুটি। আবার চেষ্টা করুন।",
    rateLimit: "সহকারী এখন ব্যস্ত। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।",
    loan: "ঋণের বিকল্পগুলি দেখুন",
    documents: "MoSJE বাধ্যতামূলক নথি",
    market: "বাজারের মানচিত্র",
    comingSoon: "লাইভ ট্রাফিক ম্যাপ শীঘ্রই আসছে",
    navChat: "চ্যাট",
    navInsights: "ইনসাইটস",
    navMarket: "মার্কেট",
    navProfile: "প্রোফাইল", totalRequirement: "মোট প্রকল্পের প্রয়োজনীয়তা", margin: "আপনার ১০% মার্জিন", loanAmount: "SCA ঋণ", repayment: "আনুমানিক মাসিক কিস্তি", repaymentNote: "৩ মাসের অবকাশের পর ৬.৫% বার্ষিক সুদে ৩৩ মাসে পরিশোধযোগ্য।", roadmap: "৭ দিনের কর্মপরিকল্পনা তৈরি করুন", documentsList: ["আধার কার্ড (মোবাইলের সঙ্গে সংযুক্ত)", "লক্ষ্য গোষ্ঠী / শ্রেণির শংসাপত্র", "স্থানীয় বসবাসের প্রমাণ"]
  }
} as const;

type ChatMessage = {
  role: "ai" | "user";
  text: string;
  time: string;
};

export default function VyaparSaathiApp() {
  const [activeScreen, setActiveScreen] = useState("welcome");
  const [language, setLanguage] = useState<keyof typeof copy>("English");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const t = copy[language];
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", text: copy.English.greeting, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [transcriptCache, setTranscriptCache] = useState<Partial<Record<keyof typeof copy, ChatMessage[]>>>({});
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vyaparState, setVyaparState] = useState<any>({
    user_profile: { language, district: "Pune", available_capital: null, skills: [], assets: [] },
    business_context: { business_name: null, candidate_zones: [], additional_details: {} },
    financial_evaluation: { total_project_cost: null }
  });

  const changeLanguage = async (nextLanguage: keyof typeof copy) => {
    if (nextLanguage === language) {
      setIsLanguageMenuOpen(false);
      return;
    }
    const previousLanguage = language;
    setLanguage(nextLanguage);
    setVyaparState((previous: any) => ({
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
      const response = await axios.post("http://127.0.0.1:8000/api/translate-chat", {
        chat_history: messages,
        language: nextLanguage,
      });
      const translatedHistory = response.data.chat_history as ChatMessage[];
      const hasProviderError = translatedHistory.some((message) => /error 500|server error|that's an error|service unavailable|too many requests/i.test(message.text));
      if (hasProviderError || translatedHistory.length !== messages.length) {
        throw new Error("Invalid translation response");
      }
      setMessages(translatedHistory);
      setTranscriptCache((previous) => ({ ...previous, [nextLanguage]: translatedHistory }));
    } catch {
      setLanguage(previousLanguage);
      setVyaparState((previous: any) => ({
        ...previous,
        user_profile: { ...previous.user_profile, language: previousLanguage },
      }));
    }
    setIsLanguageMenuOpen(false);
  };

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  const calculateProgress = () => {
    let score = 0;
    if (vyaparState.business_context?.business_name) score += 20;
    if (vyaparState.financial_evaluation?.total_project_cost) score += 20;
    if (vyaparState.user_profile?.available_capital) score += 20;
    if (vyaparState.business_context?.candidate_zones?.length > 0) score += 20;
    if (vyaparState.user_profile?.skills?.length > 0 || vyaparState.user_profile?.assets?.length > 0) score += 20;
    return Math.min(score, 100);
  };
  const progress = calculateProgress();

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    const userMsg = inputText;
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    setMessages((prev) => [...prev, { role: "user", text: userMsg, time }]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/chat-loop", {
        state: vyaparState,
        message: userMsg,
        chat_history: messages
      });
      setVyaparState(response.data.updated_state);
      const updatedMessages = [...messages, { role: "user" as const, text: userMsg, time }, { role: "ai" as const, text: response.data.response_text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }];
      setMessages(updatedMessages);
      setTranscriptCache({ [language]: updatedMessages });
    } catch (error) {
      const errorText = axios.isAxiosError(error) && error.response?.status === 429 ? t.rateLimit : t.connection;
      const errorMessages = [...messages, { role: "user" as const, text: userMsg, time }, { role: "ai" as const, text: errorText, time }];
      setMessages(errorMessages);
      setTranscriptCache({ [language]: errorMessages });
    } finally {
      setIsLoading(false);
    }
  };

  const TopAppBar = ({ title = "VyaparSaathi AI", showBack = false }) => (
    <header className="bg-surface border-b border-outline-variant fixed top-0 left-0 right-0 max-w-md mx-auto z-50 flex justify-between items-center px-4 h-16">
      <div className="flex items-center gap-3">
        {showBack ? (
          <span onClick={() => setActiveScreen('chat')} className="material-symbols-outlined text-on-surface cursor-pointer">arrow_back</span>
        ) : (
          <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>account_balance_wallet</span>
        )}
        <h1 className="font-sans text-[20px] font-bold text-primary">{title}</h1>
      </div>
      <div className="relative">
        <button
          type="button"
          aria-label="Change language"
          aria-expanded={isLanguageMenuOpen}
          onClick={() => setIsLanguageMenuOpen((open) => !open)}
          className="material-symbols-outlined text-primary rounded-lg p-1 hover:bg-surface-container transition-colors"
        >translate</button>
        {isLanguageMenuOpen && (
          <div className="absolute right-0 top-11 z-50 w-32 rounded-xl border border-outline-variant bg-white p-1.5 shadow-xl">
            {languageOptions.map((option) => (
              <button
                type="button"
                key={option.code}
                onClick={() => changeLanguage(option.code)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${language === option.code ? "bg-primary-container/20 text-primary font-bold" : "text-on-surface hover:bg-surface-container-low"}`}
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
    <nav className="bg-surface-container-lowest shadow-[0_-4px_12px_rgba(0,0,0,0.05)] fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 flex justify-around items-center px-4 py-3 pb-6 rounded-t-2xl">
      {[
        { id: 'chat', icon: 'chat_bubble', label: t.navChat },
        { id: 'insights', icon: 'analytics', label: t.navInsights },
        { id: 'market', icon: 'map', label: t.navMarket },
        { id: 'welcome', icon: 'person', label: t.navProfile }
      ].map(tab => (
        <button key={tab.id} onClick={() => setActiveScreen(tab.id)} className={`flex flex-col items-center px-3 py-1 rounded-xl transition-all ${activeScreen === tab.id ? 'bg-primary-container text-on-primary-container' : 'text-outline'}`}>
          <span className="material-symbols-outlined" style={{fontVariationSettings: activeScreen === tab.id ? "'FILL' 1" : "'FILL' 0"}}>{tab.icon}</span>
          <span className="font-body text-[10px] mt-1 font-semibold">{tab.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen max-w-md mx-auto shadow-2xl relative overflow-hidden">
      
      {activeScreen === "welcome" && (
        <div className="pt-24 px-6 flex flex-col items-center h-screen bg-surface">
          <TopAppBar />
          <h2 className="font-sans text-2xl font-bold mb-2">{t.welcome}</h2>
          <p className="text-center text-outline mb-8">{t.welcomeDescription}</p>
          
          <button onClick={() => setActiveScreen('chat')} className="w-full bg-primary text-on-primary font-sans font-bold text-lg py-4 rounded-full shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-auto mb-10">
            {t.start} <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      )}

      {activeScreen === "chat" && (
        <div className="flex flex-col h-screen">
          <TopAppBar />
          <div className="fixed top-16 left-0 right-0 max-w-md mx-auto bg-surface z-40 px-4 py-3 flex items-center gap-4">
            <span className="text-[12px] font-semibold text-outline whitespace-nowrap">{t.profile} {progress}%</span>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary-container transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto mt-[104px] mb-[160px] px-4 py-4 flex flex-col gap-5">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-1 max-w-[85%] ${msg.role === "user" ? "items-end self-end" : "items-start self-start"}`}>
                <div className={`p-4 shadow-sm border ${msg.role === "user" ? "bg-surface-container border-outline-variant/30 rounded-2xl rounded-br-sm" : "bg-surface-container-highest border-outline-variant/50 rounded-2xl rounded-bl-sm"}`}>
                  <p className="text-[15px]">{msg.text}</p>
                </div>
                <span className="text-[11px] text-outline px-2">{msg.time}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col gap-1 max-w-[85%] items-start self-start" aria-label="VyaparSaathi is typing">
                <div className="flex items-center gap-1 p-4 bg-surface-container-highest border border-outline-variant/50 rounded-2xl rounded-bl-sm shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-outline animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-outline animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-outline animate-bounce"></span>
                </div>
              </div>
            )}
            
            {progress === 100 && (
               <button onClick={() => setActiveScreen('insights')} className="mt-2 bg-primary-container/20 text-on-primary-container px-4 py-3 rounded-xl text-sm font-bold self-start flex items-center gap-2 border border-primary-container/40">
                  <span className="material-symbols-outlined">account_balance</span>
                  {t.loan}
               </button>
            )}
          </main>

          <div className="fixed bottom-[80px] left-0 right-0 max-w-md mx-auto bg-white pt-2 pb-4 px-4 border-t border-outline-variant/30 z-40">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-surface-container-lowest border-2 border-outline-variant rounded-xl flex items-center px-4 py-3 focus-within:border-secondary-container">
                <input className="w-full bg-transparent border-none p-0 outline-none" placeholder={t.type} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
              </div>
              <button onClick={sendMessage} disabled={isLoading} aria-label={isLoading ? "Waiting for response" : "Send message"} className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex justify-center items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined ml-1">send</span>
              </button>
            </div>
          </div>
          <BottomNav />
        </div>
      )}

      {activeScreen === "insights" && (
        <div className="h-screen bg-surface flex flex-col pt-16 pb-24">
          <TopAppBar title={t.documents} showBack={true} />
          
          <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
              <div className="flex justify-between items-center border-b border-surface-container pb-3 mb-4">
                <span className="text-outline text-sm">{t.totalRequirement}</span>
                <span className="font-bold font-sans text-lg">₹{vyaparState.financial_evaluation?.total_project_cost?.toLocaleString() || "1,00,000"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <span className="text-emerald-700 text-[12px] font-bold">{t.margin}</span>
                  <span className="text-emerald-700 font-black text-xl block mt-1">₹{vyaparState.financial_evaluation?.margin_money_10pct?.toLocaleString() || "10,000"}</span>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <span className="text-blue-700 text-[12px] font-bold">{t.loanAmount}</span>
                  <span className="text-blue-700 font-black text-xl block mt-1">₹{vyaparState.financial_evaluation?.loan_required_90pct?.toLocaleString() || "90,000"}</span>
                </div>
              </div>
            </div>

            <div className="bg-secondary-container text-white rounded-2xl p-5 shadow-md">
              <span className="text-white/80 text-xs font-bold uppercase">{t.repayment}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black">₹{vyaparState.financial_evaluation?.estimated_monthly_emi?.toLocaleString() || "2,980"}</span>
                <span className="text-sm">/ month</span>
              </div>
              <p className="text-white/70 text-xs mt-3">{t.repaymentNote}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
              <h3 className="font-bold font-sans mb-3 text-on-surface">{t.documents}</h3>
              <ul className="flex flex-col gap-3">
                {t.documentsList.map(item => (
                  <li key={item} className="flex gap-3 items-center">
                    <span className="material-symbols-outlined text-primary-container text-[20px]">check_circle</span>
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button onClick={() => setActiveScreen('market')} className="w-full bg-primary text-on-primary font-sans font-bold py-4 rounded-xl shadow-lg mt-2 flex justify-center items-center gap-2">
              {t.roadmap} <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </main>
          <BottomNav />
        </div>
      )}

      {activeScreen === "market" && (
        <div className="h-screen bg-surface flex flex-col pt-16 pb-24 items-center justify-center">
          <TopAppBar title={t.market} showBack={true} />
          <span className="material-symbols-outlined text-[60px] text-outline opacity-50 mb-4">map</span>
          <p className="text-outline font-semibold">{t.comingSoon}</p>
          <BottomNav />
        </div>
      )}
    </div>
  );
}