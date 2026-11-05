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
type Screen = "home" | "advisor" | "market" | "time" | "money" | "plan";

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
  timeTitle: string;
  bestWindow: string;
  weatherTitle: string;
  weatherButton: string;
  weatherLocation: string;
  weatherLoading: string;
  weatherError: string;
  rainAdvice: string;
  heatAdvice: string;
  normalAdvice: string;
  cityPulse: string;
  noNews: string;
  category: string;
  fastFood: string;
  placesFound: string;
  population: string;
  placesPerTenThousand: string;
  cityMedian: string;
  verifyGround: string;
  mapUnavailable: string;
  noCategorySample: string;
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
    planMessage: "Your answers are saved on this device. Use the Money planner to calculate costs, break-even and funding needs.",
    navChat: "Saathi",
    navPlan: "My plan",
    navMarket: "Market",
    navHome: "Home",
    back: "Back to home",
    timeTitle: "Rush Clock",
    bestWindow: "Best 3-hour window",
    weatherTitle: "Weather Day Planner",
    weatherButton: "Check weather near me",
    weatherLocation: "Your location is only used to fetch the local forecast.",
    weatherLoading: "Loading forecast...",
    weatherError: "Could not load a forecast. Check location permission and try again.",
    rainAdvice: "Rain is likely. Choose a covered spot and protect your stock.",
    heatAdvice: "It may be very hot. Plan shade, water and suitable products.",
    normalAdvice: "No rain or heat alert in the next few hours.",
    cityPulse: "City Pulse",
    noNews: "No verified local headlines are loaded for this city yet.",
    category: "Business category",
    fastFood: "Fast food",
    placesFound: "Similar places found",
    population: "Residents in sample",
    placesPerTenThousand: "Places per 10,000 people",
    cityMedian: "City median",
    verifyGround: "A gap is a hint, not proof. Verify the spot on the ground.",
    mapUnavailable: "Ward boundary files are not loaded, so this is a data list rather than a map.",
    noCategorySample: "No sample count is available for this category and city.",
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
    planMessage: "आपके जवाब इस डिवाइस पर सेव हैं। लागत, ब्रेक-ईवन और पूंजी की जरूरत निकालने के लिए पैसा योजनाकार खोलें।",
    navChat: "साथी",
    navPlan: "मेरी योजना",
    navMarket: "बाज़ार",
    navHome: "होम",
    back: "होम पर वापस",
    timeTitle: "भीड़ का समय",
    bestWindow: "सबसे अच्छा 3 घंटे का समय",
    weatherTitle: "मौसम की योजना",
    weatherButton: "मेरे पास का मौसम देखें",
    weatherLocation: "आपकी जगह का उपयोग केवल स्थानीय मौसम जानने के लिए होगा।",
    weatherLoading: "मौसम का पूर्वानुमान लोड हो रहा है...",
    weatherError: "पूर्वानुमान नहीं मिला। स्थान की अनुमति जांचकर फिर कोशिश करें।",
    rainAdvice: "बारिश की संभावना है। ढकी हुई जगह चुनें और सामान सुरक्षित रखें।",
    heatAdvice: "गर्मी अधिक हो सकती है। छाया, पानी और सही उत्पादों की योजना बनाएं।",
    normalAdvice: "अगले कुछ घंटों के लिए बारिश या गर्मी की चेतावनी नहीं है।",
    cityPulse: "शहर की खबरें",
    noNews: "इस शहर की कोई सत्यापित स्थानीय खबर अभी उपलब्ध नहीं है।",
    category: "व्यवसाय की श्रेणी",
    fastFood: "फास्ट फूड",
    placesFound: "मिले-जुले व्यवसाय",
    population: "नमूने में निवासी",
    placesPerTenThousand: "10,000 लोगों पर व्यवसाय",
    cityMedian: "शहर का मध्य मान",
    verifyGround: "गैप केवल संकेत है, प्रमाण नहीं। जगह पर जाकर जांचें।",
    mapUnavailable: "वार्ड की सीमा वाली फाइलें उपलब्ध नहीं हैं, इसलिए यह नक्शे के बजाय डेटा सूची है।",
    noCategorySample: "इस शहर और श्रेणी के लिए नमूना गिनती उपलब्ध नहीं है।",
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
    planMessage: "तुमची उत्तरे या डिव्हाइसवर जतन केली आहेत. खर्च, ब्रेक-इव्हन आणि भांडवलाची गरज मोजण्यासाठी पैसे नियोजक उघडा.",
    navChat: "साथी",
    navPlan: "माझी योजना",
    navMarket: "बाजार",
    navHome: "मुख्यपृष्ठ",
    back: "मुख्यपृष्ठावर परत",
    timeTitle: "गर्दीची वेळ",
    bestWindow: "सर्वोत्तम 3 तासांचा कालावधी",
    weatherTitle: "हवामान नियोजन",
    weatherButton: "माझ्या जवळचे हवामान पाहा",
    weatherLocation: "तुमचे स्थान फक्त स्थानिक हवामानाचा अंदाज मिळवण्यासाठी वापरले जाईल.",
    weatherLoading: "हवामानाचा अंदाज लोड होत आहे...",
    weatherError: "अंदाज मिळाला नाही. स्थानाची परवानगी तपासून पुन्हा प्रयत्न करा.",
    rainAdvice: "पावसाची शक्यता आहे. आच्छादित जागा निवडा आणि सामान सुरक्षित ठेवा.",
    heatAdvice: "खूप उष्णता असू शकते. सावली, पाणी आणि योग्य उत्पादनांचे नियोजन करा.",
    normalAdvice: "पुढील काही तासांसाठी पाऊस किंवा उष्णतेचा इशारा नाही.",
    cityPulse: "शहरातील घडामोडी",
    noNews: "या शहरासाठी सत्यापित स्थानिक बातम्या अजून उपलब्ध नाहीत.",
    category: "व्यवसायाचा प्रकार",
    fastFood: "फास्ट फूड",
    placesFound: "सापडलेली समान दुकाने",
    population: "नमुन्यातील रहिवासी",
    placesPerTenThousand: "10,000 लोकांमागे दुकाने",
    cityMedian: "शहराचा मध्यक",
    verifyGround: "गॅप हा संकेत आहे, पुरावा नाही. जागेवर जाऊन खात्री करा.",
    mapUnavailable: "वॉर्ड सीमांच्या फाइल्स उपलब्ध नाहीत, त्यामुळे नकाशाऐवजी डेटा सूची दिसते.",
    noCategorySample: "या शहरासाठी आणि प्रकारासाठी नमुना मोजणी उपलब्ध नाही.",
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
    planMessage: "તમારા જવાબો આ ઉપકરણ પર સાચવ્યા છે. ખર્ચ, બ્રેક-ઈવન અને ભંડોળની જરૂર ગણવા માટે પૈસાનું આયોજન ખોલો.",
    navChat: "સાથી",
    navPlan: "મારી યોજના",
    navMarket: "બજાર",
    navHome: "હોમ",
    back: "હોમ પર પાછા",
    timeTitle: "ભીડનો સમય",
    bestWindow: "શ્રેષ્ઠ 3 કલાકનો સમય",
    weatherTitle: "હવામાન આયોજન",
    weatherButton: "મારી નજીકનું હવામાન જુઓ",
    weatherLocation: "તમારા સ્થાનનો ઉપયોગ માત્ર સ્થાનિક હવામાન જાણવા માટે થશે.",
    weatherLoading: "હવામાન આગાહી લોડ થઈ રહી છે...",
    weatherError: "આગાહી મળી શકી નથી. સ્થાનની મંજૂરી તપાસીને ફરી પ્રયાસ કરો.",
    rainAdvice: "વરસાદની શક્યતા છે. ઢંકાયેલી જગ્યા પસંદ કરો અને સામાન સુરક્ષિત રાખો.",
    heatAdvice: "ખૂબ ગરમી હોઈ શકે છે. છાંયો, પાણી અને યોગ્ય ઉત્પાદનોનું આયોજન કરો.",
    normalAdvice: "આગામી થોડા કલાકોમાં વરસાદ કે ગરમીની ચેતવણી નથી.",
    cityPulse: "શહેરની ખબર",
    noNews: "આ શહેર માટે ચકાસેલી સ્થાનિક ખબર હજી ઉપલબ્ધ નથી.",
    category: "વ્યવસાયની શ્રેણી",
    fastFood: "ફાસ્ટ ફૂડ",
    placesFound: "મળેલી સમાન દુકાનો",
    population: "નમૂનામાં રહેવાસીઓ",
    placesPerTenThousand: "10,000 લોકો દીઠ દુકાનો",
    cityMedian: "શહેરનો મધ્યક",
    verifyGround: "ગૅપ માત્ર સંકેત છે, પુરાવો નથી. સ્થળે જઈને તપાસો.",
    mapUnavailable: "વોર્ડની સીમાની ફાઇલો ઉપલબ્ધ નથી, તેથી નકશાને બદલે ડેટાની યાદી છે.",
    noCategorySample: "આ શહેર અને શ્રેણી માટે નમૂનાની ગણતરી ઉપલબ્ધ નથી.",
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
    planMessage: "আপনার উত্তর এই ডিভাইসে সংরক্ষিত। খরচ, ব্রেক-ইভেন ও অর্থের প্রয়োজন হিসাব করতে টাকার পরিকল্পনা খুলুন।",
    navChat: "সাথী",
    navPlan: "আমার পরিকল্পনা",
    navMarket: "বাজার",
    navHome: "হোম",
    back: "হোমে ফিরে যান",
    timeTitle: "ব্যস্ত সময়",
    bestWindow: "সেরা ৩ ঘণ্টার সময়",
    weatherTitle: "আবহাওয়ার পরিকল্পনা",
    weatherButton: "আমার কাছের আবহাওয়া দেখুন",
    weatherLocation: "আপনার অবস্থান শুধু স্থানীয় পূর্বাভাস জানার জন্য ব্যবহার হবে।",
    weatherLoading: "আবহাওয়ার পূর্বাভাস লোড হচ্ছে...",
    weatherError: "পূর্বাভাস পাওয়া যায়নি। অবস্থানের অনুমতি দেখে আবার চেষ্টা করুন।",
    rainAdvice: "বৃষ্টির সম্ভাবনা আছে। ছাউনি-ওয়ালা জায়গা বেছে পণ্য সুরক্ষিত রাখুন।",
    heatAdvice: "খুব গরম হতে পারে। ছায়া, জল এবং উপযুক্ত পণ্যের পরিকল্পনা করুন।",
    normalAdvice: "আগামী কয়েক ঘণ্টায় বৃষ্টি বা গরমের সতর্কতা নেই।",
    cityPulse: "শহরের খবর",
    noNews: "এই শহরের যাচাই করা স্থানীয় খবর এখনও যোগ করা হয়নি।",
    category: "ব্যবসার ধরন",
    fastFood: "ফাস্ট ফুড",
    placesFound: "পাওয়া একই ধরনের দোকান",
    population: "নমুনার বাসিন্দা",
    placesPerTenThousand: "প্রতি ১০,০০০ জনে দোকান",
    cityMedian: "শহরের মধ্যম মান",
    verifyGround: "গ্যাপ একটি ইঙ্গিত, প্রমাণ নয়। জায়গাটি সরেজমিনে যাচাই করুন।",
    mapUnavailable: "ওয়ার্ডের সীমানার ফাইল নেই, তাই মানচিত্রের বদলে ডেটার তালিকা দেখানো হচ্ছে।",
    noCategorySample: "এই শহর ও ব্যবসার ধরনের জন্য নমুনা গণনা নেই।",
  },
};

type MoneyCopy = {
  navLabel: string;
  title: string;
  loading: string;
  selectBusiness: string;
  sellingPrice: string;
  unitCost: string;
  startupCost: string;
  fixedCosts: string;
  availableCapital: string;
  dailyUnits: string;
  annualRate: string;
  termMonths: string;
  calculate: string;
  margin: string;
  breakEven: string;
  monthlyProfit: string;
  fundingGap: string;
  emi: string;
  useRecipe: string;
  loanOptions: string;
  wantsLoan: string;
  noLoan: string;
  specialCategory: string;
  women: string;
  scst: string;
  findSchemes: string;
  noSchemes: string;
  preliminary: string;
  verify: string;
  licences: string;
  landedTitle: string;
  supplier: string;
  quantity: string;
  unitPrice: string;
  transport: string;
  charges: string;
  addSupplier: string;
  perUnit: string;
  error: string;
};

const moneyCopy: Record<Language, MoneyCopy> = {
  English: {
    navLabel: "Money", title: "Money, schemes & licences", loading: "Calculating...", selectBusiness: "Business idea", sellingPrice: "Selling price per item",
    unitCost: "Cost to make one item", startupCost: "One-time setup cost", fixedCosts: "Monthly fixed costs",
    availableCapital: "Your available money", dailyUnits: "Expected sales per day", annualRate: "Annual interest rate (%)",
    termMonths: "Loan term (months)", calculate: "Calculate plan", margin: "Margin per item",
    breakEven: "Break-even items per day", monthlyProfit: "Estimated monthly profit", fundingGap: "Funding gap",
    emi: "Estimated monthly EMI", useRecipe: "Calculate sample momo recipe", loanOptions: "Loan options",
    wantsLoan: "Show possible loan schemes", noLoan: "I do not want a loan", specialCategory: "Optional eligibility category",
    women: "Woman-led", scst: "SC/ST-led", findSchemes: "Find preliminary matches", noSchemes: "No preliminary matches for these choices.",
    preliminary: "Preliminary matches only, not eligibility or approval. Scheme details are not independently date-verified; terms may change.",
    verify: "Verify current rules and eligibility with the official portal, lender, or city office.",
    licences: "Permits and registrations to check", landedTitle: "Compare supplier landed cost",
    supplier: "Supplier name", quantity: "Quantity", unitPrice: "Price per unit (₹)", transport: "Transport cost (₹)",
    charges: "Other charges (₹)", addSupplier: "Add supplier quote", perUnit: "Landed cost per unit",
    error: "Could not load or calculate this information. Please try again.",
  },
  Hindi: {
    navLabel: "पैसा", title: "पैसा, योजनाएं और लाइसेंस", loading: "गणना हो रही है...", selectBusiness: "व्यवसाय का विचार", sellingPrice: "एक वस्तु का बिक्री मूल्य",
    unitCost: "एक वस्तु बनाने की लागत", startupCost: "एक बार की शुरुआती लागत", fixedCosts: "मासिक स्थिर खर्च",
    availableCapital: "आपकी उपलब्ध राशि", dailyUnits: "प्रतिदिन अनुमानित बिक्री", annualRate: "वार्षिक ब्याज दर (%)",
    termMonths: "ऋण अवधि (महीने)", calculate: "योजना की गणना करें", margin: "प्रति वस्तु मार्जिन",
    breakEven: "प्रतिदिन ब्रेक-ईवन वस्तुएं", monthlyProfit: "अनुमानित मासिक लाभ", fundingGap: "पूंजी की कमी",
    emi: "अनुमानित मासिक ईएमआई", useRecipe: "नमूना मोमो रेसिपी की लागत निकालें", loanOptions: "ऋण विकल्प",
    wantsLoan: "संभावित ऋण योजनाएं दिखाएं", noLoan: "मुझे ऋण नहीं चाहिए", specialCategory: "वैकल्पिक पात्रता श्रेणी",
    women: "महिला-नेतृत्व", scst: "SC/ST-नेतृत्व", findSchemes: "प्रारंभिक मिलान देखें", noSchemes: "इन विकल्पों के लिए कोई प्रारंभिक मिलान नहीं।",
    preliminary: "ये प्रारंभिक मिलान हैं, पात्रता या मंजूरी नहीं। योजनाओं की तारीख की स्वतंत्र पुष्टि नहीं हुई है; शर्तें बदल सकती हैं।",
    verify: "आधिकारिक पोर्टल, ऋणदाता या शहर कार्यालय से मौजूदा नियम और पात्रता जांचें।",
    licences: "जांचने योग्य परमिट और पंजीकरण", landedTitle: "आपूर्तिकर्ता की कुल लागत की तुलना",
    supplier: "आपूर्तिकर्ता का नाम", quantity: "मात्रा", unitPrice: "प्रति इकाई मूल्य (₹)", transport: "परिवहन लागत (₹)",
    charges: "अन्य शुल्क (₹)", addSupplier: "आपूर्तिकर्ता का भाव जोड़ें", perUnit: "प्रति इकाई पहुंची लागत",
    error: "जानकारी लोड या गणना नहीं हो सकी। फिर कोशिश करें।",
  },
  Marathi: {
    navLabel: "पैसे", title: "पैसे, योजना आणि परवाने", loading: "गणना सुरू आहे...", selectBusiness: "व्यवसायाची कल्पना", sellingPrice: "एका वस्तूची विक्री किंमत",
    unitCost: "एक वस्तू बनवण्याचा खर्च", startupCost: "एकदाचा सुरुवातीचा खर्च", fixedCosts: "मासिक स्थिर खर्च",
    availableCapital: "तुमच्याकडील उपलब्ध रक्कम", dailyUnits: "दररोज अपेक्षित विक्री", annualRate: "वार्षिक व्याजदर (%)",
    termMonths: "कर्जाचा कालावधी (महिने)", calculate: "योजनेची गणना करा", margin: "प्रति वस्तू मार्जिन",
    breakEven: "दररोज ब्रेक-इव्हन वस्तू", monthlyProfit: "अंदाजे मासिक नफा", fundingGap: "भांडवलाची कमतरता",
    emi: "अंदाजे मासिक EMI", useRecipe: "नमुना मोमो रेसिपीचा खर्च काढा", loanOptions: "कर्जाचे पर्याय",
    wantsLoan: "संभाव्य कर्ज योजना दाखवा", noLoan: "मला कर्ज नको", specialCategory: "ऐच्छिक पात्रता गट",
    women: "महिला-नेतृत्व", scst: "SC/ST-नेतृत्व", findSchemes: "प्राथमिक जुळणी शोधा", noSchemes: "या पर्यायांसाठी प्राथमिक जुळणी नाही.",
    preliminary: "ही प्राथमिक जुळणी आहे; पात्रता किंवा मंजुरी नाही. योजनांच्या तारखांची स्वतंत्र पडताळणी नाही; अटी बदलू शकतात.",
    verify: "अधिकृत पोर्टल, कर्जदाता किंवा शहर कार्यालयाकडून सध्याचे नियम आणि पात्रता तपासा.",
    licences: "तपासायचे परवाने आणि नोंदणी", landedTitle: "पुरवठादाराच्या एकूण खर्चाची तुलना",
    supplier: "पुरवठादाराचे नाव", quantity: "प्रमाण", unitPrice: "प्रति युनिट किंमत (₹)", transport: "वाहतूक खर्च (₹)",
    charges: "इतर शुल्क (₹)", addSupplier: "पुरवठादाराचा दर जोडा", perUnit: "प्रति युनिट पोहोच खर्च",
    error: "माहिती लोड किंवा मोजता आली नाही. पुन्हा प्रयत्न करा.",
  },
  Gujarati: {
    navLabel: "પૈસા", title: "પૈસા, યોજનાઓ અને લાઇસન્સ", loading: "ગણતરી થઈ રહી છે...", selectBusiness: "વ્યવસાયનો વિચાર", sellingPrice: "એક વસ્તુની વેચાણ કિંમત",
    unitCost: "એક વસ્તુ બનાવવાનો ખર્ચ", startupCost: "એક વખતનો શરૂઆતનો ખર્ચ", fixedCosts: "માસિક નિશ્ચિત ખર્ચ",
    availableCapital: "તમારી ઉપલબ્ધ રકમ", dailyUnits: "દરરોજનું અનુમાનિત વેચાણ", annualRate: "વાર્ષિક વ્યાજ દર (%)",
    termMonths: "લોનનો સમયગાળો (મહિના)", calculate: "યોજનાની ગણતરી કરો", margin: "દરેક વસ્તુનું માર્જિન",
    breakEven: "દરરોજની બ્રેક-ઈવન વસ્તુઓ", monthlyProfit: "અંદાજિત માસિક નફો", fundingGap: "ભંડોળની ખોટ",
    emi: "અંદાજિત માસિક EMI", useRecipe: "નમૂનાની મોમો રેસિપીનો ખર્ચ ગણો", loanOptions: "લોનના વિકલ્પો",
    wantsLoan: "સંભવિત લોન યોજનાઓ બતાવો", noLoan: "મારે લોન નથી જોઈતી", specialCategory: "વૈકલ્પિક પાત્રતા શ્રેણી",
    women: "મહિલા-આગેવાની", scst: "SC/ST-આગેવાની", findSchemes: "પ્રાથમિક મેળ શોધો", noSchemes: "આ પસંદગીઓ માટે પ્રાથમિક મેળ નથી.",
    preliminary: "આ પ્રાથમિક મેળ છે, પાત્રતા કે મંજૂરી નથી. યોજનાઓની તારીખની સ્વતંત્ર ચકાસણી નથી; શરતો બદલાઈ શકે છે.",
    verify: "સત્તાવાર પોર્ટલ, ધિરાણકર્તા અથવા શહેર કચેરી પાસેથી હાલના નિયમો અને પાત્રતા તપાસો.",
    licences: "તપાસવાના પરવાના અને નોંધણીઓ", landedTitle: "પુરવઠાકર્તાના કુલ ખર્ચની તુલના",
    supplier: "પુરવઠાકર્તાનું નામ", quantity: "જથ્થો", unitPrice: "એકમ દીઠ કિંમત (₹)", transport: "પરિવહન ખર્ચ (₹)",
    charges: "અન્ય ચાર્જ (₹)", addSupplier: "પુરવઠાકર્તાનો ભાવ ઉમેરો", perUnit: "એકમ દીઠ પહોંચેલો ખર્ચ",
    error: "માહિતી લોડ અથવા ગણતરી થઈ શકી નથી. ફરી પ્રયાસ કરો.",
  },
  Bengali: {
    navLabel: "টাকা", title: "টাকা, প্রকল্প ও লাইসেন্স", loading: "হিসাব হচ্ছে...", selectBusiness: "ব্যবসার ধারণা", sellingPrice: "প্রতি পণ্যের বিক্রয়মূল্য",
    unitCost: "একটি পণ্য তৈরির খরচ", startupCost: "এককালীন শুরুর খরচ", fixedCosts: "মাসিক স্থায়ী খরচ",
    availableCapital: "আপনার হাতে থাকা টাকা", dailyUnits: "প্রতিদিনের সম্ভাব্য বিক্রি", annualRate: "বার্ষিক সুদের হার (%)",
    termMonths: "ঋণের মেয়াদ (মাস)", calculate: "পরিকল্পনার হিসাব করুন", margin: "প্রতি পণ্যের মার্জিন",
    breakEven: "প্রতিদিনের ব্রেক-ইভেন পণ্য", monthlyProfit: "আনুমানিক মাসিক লাভ", fundingGap: "অর্থের ঘাটতি",
    emi: "আনুমানিক মাসিক EMI", useRecipe: "নমুনা মোমো রেসিপির খরচ হিসাব করুন", loanOptions: "ঋণের বিকল্প",
    wantsLoan: "সম্ভাব্য ঋণ প্রকল্প দেখান", noLoan: "আমার ঋণ চাই না", specialCategory: "ঐচ্ছিক যোগ্যতার বিভাগ",
    women: "নারী-নেতৃত্বাধীন", scst: "SC/ST-নেতৃত্বাধীন", findSchemes: "প্রাথমিক মিল খুঁজুন", noSchemes: "এই পছন্দে কোনো প্রাথমিক মিল নেই।",
    preliminary: "এগুলি প্রাথমিক মিল, যোগ্যতা বা অনুমোদন নয়। প্রকল্পের তারিখ স্বাধীনভাবে যাচাই করা হয়নি; শর্ত বদলাতে পারে।",
    verify: "সরকারি পোর্টাল, ঋণদাতা বা শহর দপ্তরে বর্তমান নিয়ম ও যোগ্যতা যাচাই করুন।",
    licences: "যে অনুমতি ও নিবন্ধন যাচাই করবেন", landedTitle: "সরবরাহকারীর মোট খরচ তুলনা",
    supplier: "সরবরাহকারীর নাম", quantity: "পরিমাণ", unitPrice: "প্রতি এককের দাম (₹)", transport: "পরিবহন খরচ (₹)",
    charges: "অন্যান্য খরচ (₹)", addSupplier: "সরবরাহকারীর দর যোগ করুন", perUnit: "প্রতি এককের পৌঁছানোর খরচ",
    error: "তথ্য লোড বা হিসাব করা যায়নি। আবার চেষ্টা করুন।",
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

type RecipeIngredient = {
  name: string;
  weight_g: number;
  mandi_price_per_quintal?: number;
  retail_price_per_kg?: number;
  fixed_cost?: number;
};

type BusinessTemplate = {
  id: string;
  name: string;
  model: "mobile" | "fixed" | "home";
  selling_price: number;
  startup_cost: number;
  fixed_monthly_cost?: number;
  unit_cost: number | null;
  unit_cost_is_sample: boolean;
  recipe?: RecipeIngredient[];
};

type MoneyInputs = {
  businessId: string;
  sellingPrice: string;
  unitCost: string;
  startupCost: string;
  fixedCosts: string;
  availableCapital: string;
  dailyUnits: string;
  annualRate: string;
  termMonths: string;
};

type FinanceResult = {
  margin_per_unit: number;
  break_even_units_per_day: number | null;
  estimated_monthly_profit: number;
  funding_gap: number;
  loan_required: boolean;
  monthly_emi: number;
};

type SchemeMatch = {
  id: string;
  name: string;
  maximum_amount: number;
  official_url: string | null;
  documents: string[];
  note: string;
  last_checked: string | null;
  match_percent: number;
  match_label: string;
  reasons: string[];
  verify_before_applying: boolean;
};

type LicenceItem = {
  id: string;
  name: string;
  where: string;
  official_url: string | null;
  note: string;
  required: boolean;
};

type SupplierQuote = {
  supplier: string;
  landedCost: number;
};

type GroundInputs = {
  peopleCount: string;
  minutesCounted: string;
  sellingHours: string;
  buyingRate: string;
  observedPrice: string;
  monthlyRent: string;
};

type PilotInputs = {
  forecast: string;
  dailySales: string[];
  dailyExpenses: string[];
};

type FootfallResult = {
  people_per_hour: number;
  estimated_units_per_day: number;
  buying_rate: number;
};

type RentBurdenResult = {
  monthly_rent: number;
  estimated_monthly_sales: number;
  rent_share_percent: number | null;
};

type PilotResult = {
  days_recorded: number;
  average_units_per_day: number;
  forecast_units_per_day: number;
  forecast_ratio: number;
  verdict: "good sign" | "slightly below forecast" | "try another spot";
  gross_revenue?: number;
  item_cost?: number;
  gross_profit?: number;
  other_expenses?: number;
  net_profit?: number;
};

type GroundPilotCopy = {
  groundTitle: string;
  groundNote: string;
  peopleCount: string;
  minutesCounted: string;
  sellingHours: string;
  buyingRate: string;
  estimateFootfall: string;
  peoplePerHour: string;
  estimatedUnits: string;
  priceTitle: string;
  observedPrice: string;
  addPrice: string;
  checkedPrices: string;
  priceMedian: string;
  proposedPrice: string;
  rent: string;
  compareRent: string;
  rentShare: string;
  rentNote: string;
  pilotTitle: string;
  pilotNote: string;
  targetUnits: string;
  dayUnits: string;
  evaluatePilot: string;
  daysRecorded: string;
  averageSales: string;
  forecastRatio: string;
  dailyExpense: string;
  grossRevenue: string;
  itemCost: string;
  grossProfit: string;
  netProfit: string;
  goodSign: string;
  belowForecast: string;
  tryAnotherSpot: string;
};

const groundCopy: Record<Language, GroundPilotCopy> = {
  English: {
    groundTitle: "Ground Truth Kit",
    groundNote: "Record what you observe locally. Footfall conversion is only a planning assumption; results are not a guarantee.",
    peopleCount: "People who passed",
    minutesCounted: "Minutes counted",
    sellingHours: "Planned selling hours per day",
    buyingRate: "Estimated buyers (%)",
    estimateFootfall: "Estimate daily footfall sales",
    peoplePerHour: "People per hour",
    estimatedUnits: "Estimated units per day",
    priceTitle: "Nearby price checks",
    observedPrice: "Observed competitor price (₹)",
    addPrice: "Add observed price",
    checkedPrices: "Prices recorded",
    priceMedian: "Observed median price",
    proposedPrice: "Your planned price",
    rent: "Monthly rent (₹)",
    compareRent: "Compare rent with estimated sales",
    rentShare: "Rent share of estimated monthly sales",
    rentNote: "Comparison only, based on a 30-day estimate. There is no universal safe rent threshold.",
    pilotTitle: "7-day Pilot Khata",
    pilotNote: "Enter actual units sold and, when known, other daily expenses. Entries are saved on this device.",
    targetUnits: "Forecast units per day",
    dayUnits: "Units sold",
    evaluatePilot: "Review pilot results",
    daysRecorded: "Days recorded",
    averageSales: "Average units sold per day",
    forecastRatio: "Average versus forecast",
    dailyExpense: "Other daily expenses (₹)",
    grossRevenue: "Recorded-item revenue",
    itemCost: "Recorded-item cost",
    grossProfit: "Gross profit",
    netProfit: "Profit after entered expenses",
    goodSign: "Good sign against your forecast",
    belowForecast: "Slightly below your forecast",
    tryAnotherSpot: "Consider testing another spot",
  },
  Hindi: {
    groundTitle: "जमीनी जानकारी किट",
    groundNote: "स्थानीय निरीक्षण दर्ज करें। ग्राहक बनने का अनुपात केवल योजना का अनुमान है, नतीजे की गारंटी नहीं।",
    peopleCount: "गुज़रने वाले लोग",
    minutesCounted: "गिनने के मिनट",
    sellingHours: "रोज़ बिक्री के घंटे",
    buyingRate: "अनुमानित खरीदार (%)",
    estimateFootfall: "दैनिक बिक्री का अनुमान",
    peoplePerHour: "प्रति घंटे लोग",
    estimatedUnits: "प्रतिदिन अनुमानित वस्तुएं",
    priceTitle: "आसपास की कीमतें",
    observedPrice: "दूसरी दुकान का देखा मूल्य (₹)",
    addPrice: "देखा गया मूल्य जोड़ें",
    checkedPrices: "दर्ज कीमतें",
    priceMedian: "दर्ज कीमतों का मध्य मान",
    proposedPrice: "आपका प्रस्तावित मूल्य",
    rent: "मासिक किराया (₹)",
    compareRent: "अनुमानित बिक्री से किराये की तुलना",
    rentShare: "अनुमानित मासिक बिक्री में किराये का हिस्सा",
    rentNote: "30 दिन के अनुमान पर तुलना। किराये की कोई एक सार्वभौमिक सुरक्षित सीमा नहीं है।",
    pilotTitle: "7-दिन की पायलट खाता-बही",
    pilotNote: "पूरे हुए दिनों की वास्तविक बिक्री और, ज्ञात हो तो, अन्य खर्च दर्ज करें। प्रविष्टियां इस डिवाइस पर सेव होंगी।",
    targetUnits: "प्रतिदिन अनुमानित बिक्री",
    dayUnits: "बिकी हुई वस्तुएं",
    evaluatePilot: "पायलट नतीजे देखें",
    daysRecorded: "दर्ज दिन",
    averageSales: "प्रतिदिन औसत बिक्री",
    forecastRatio: "औसत बनाम अनुमान",
    dailyExpense: "अन्य दैनिक खर्च (₹)",
    grossRevenue: "दर्ज वस्तुओं की बिक्री",
    itemCost: "दर्ज वस्तुओं की लागत",
    grossProfit: "सकल लाभ",
    netProfit: "दर्ज खर्चों के बाद लाभ",
    goodSign: "आपके अनुमान के मुकाबले अच्छा संकेत",
    belowForecast: "आपके अनुमान से थोड़ा कम",
    tryAnotherSpot: "दूसरी जगह पर परीक्षण करने पर विचार करें",
  },
  Marathi: {
    groundTitle: "प्रत्यक्ष माहिती किट",
    groundNote: "स्थानिक निरीक्षण नोंदवा. ग्राहक होण्याचे प्रमाण हा केवळ नियोजनाचा अंदाज आहे; हमी नाही.",
    peopleCount: "जाणारे लोक",
    minutesCounted: "मोजलेली मिनिटे",
    sellingHours: "दररोजचे नियोजित विक्री तास",
    buyingRate: "अंदाजे ग्राहक (%)",
    estimateFootfall: "दैनिक विक्रीचा अंदाज",
    peoplePerHour: "प्रति तास लोक",
    estimatedUnits: "दररोज अंदाजे वस्तू",
    priceTitle: "जवळपासच्या किंमती",
    observedPrice: "दुसऱ्या दुकानात दिसलेली किंमत (₹)",
    addPrice: "दिसलेली किंमत जोडा",
    checkedPrices: "नोंदवलेल्या किंमती",
    priceMedian: "नोंदवलेल्या किंमतींचा मध्यक",
    proposedPrice: "तुमची नियोजित किंमत",
    rent: "मासिक भाडे (₹)",
    compareRent: "अंदाजे विक्रीशी भाड्याची तुलना",
    rentShare: "अंदाजे मासिक विक्रीतील भाड्याचा हिस्सा",
    rentNote: "30 दिवसांच्या अंदाजावर आधारित तुलना; भाड्याची एकच सार्वत्रिक सुरक्षित मर्यादा नाही.",
    pilotTitle: "7-दिवसांची पायलट खातेवही",
    pilotNote: "पूर्ण दिवसांची प्रत्यक्ष विक्री आणि माहीत असल्यास इतर खर्च नोंदवा. नोंदी या डिव्हाइसवर जतन होतील.",
    targetUnits: "दररोजचा अंदाज",
    dayUnits: "विकलेल्या वस्तू",
    evaluatePilot: "पायलटचा आढावा घ्या",
    daysRecorded: "नोंदवलेले दिवस",
    averageSales: "दररोजची सरासरी विक्री",
    forecastRatio: "सरासरी विरुद्ध अंदाज",
    dailyExpense: "इतर दैनिक खर्च (₹)",
    grossRevenue: "नोंदवलेल्या वस्तूंची विक्री",
    itemCost: "नोंदवलेल्या वस्तूंचा खर्च",
    grossProfit: "एकूण नफा",
    netProfit: "नोंदवलेल्या खर्चानंतरचा नफा",
    goodSign: "अंदाजाच्या तुलनेत चांगले चिन्ह",
    belowForecast: "अंदाजापेक्षा थोडी कमी विक्री",
    tryAnotherSpot: "दुसऱ्या जागेवर चाचणी करण्याचा विचार करा",
  },
  Gujarati: {
    groundTitle: "જમીની માહિતી કિટ",
    groundNote: "સ્થાનિક નિરીક્ષણ નોંધો. ખરીદી રૂપાંતર માત્ર આયોજનનો અંદાજ છે, પરિણામની ખાતરી નથી.",
    peopleCount: "પસાર થતા લોકો",
    minutesCounted: "ગણતરીના મિનિટ",
    sellingHours: "દરરોજના આયોજન કરેલા વેચાણ કલાક",
    buyingRate: "અંદાજિત ખરીદદારો (%)",
    estimateFootfall: "દૈનિક વેચાણનો અંદાજ",
    peoplePerHour: "દર કલાકે લોકો",
    estimatedUnits: "દરરોજ અંદાજિત વસ્તુઓ",
    priceTitle: "નજીકના ભાવની નોંધ",
    observedPrice: "બીજા વેપારીનો જોયેલો ભાવ (₹)",
    addPrice: "જોયેલો ભાવ ઉમેરો",
    checkedPrices: "નોંધેલા ભાવ",
    priceMedian: "નોંધેલા ભાવનો મધ્યક",
    proposedPrice: "તમારો આયોજન કરેલો ભાવ",
    rent: "માસિક ભાડું (₹)",
    compareRent: "અંદાજિત વેચાણ સાથે ભાડાની તુલના",
    rentShare: "અંદાજિત માસિક વેચાણમાં ભાડાનો હિસ્સો",
    rentNote: "30 દિવસના અંદાજ પર તુલના; ભાડાની કોઈ એક સર્વમાન્ય સલામત મર્યાદા નથી.",
    pilotTitle: "7-દિવસની પાયલોટ ખાતાવહી",
    pilotNote: "પૂર્ણ થયેલા દિવસોનું વાસ્તવિક વેચાણ અને ખબર હોય તો અન્ય ખર્ચ નોંધો. નોંધો આ ઉપકરણ પર સાચવાશે.",
    targetUnits: "દરરોજનો અંદાજ",
    dayUnits: "વેચાયેલી વસ્તુઓ",
    evaluatePilot: "પાયલોટનું મૂલ્યાંકન કરો",
    daysRecorded: "નોંધેલા દિવસો",
    averageSales: "દરરોજનું સરેરાશ વેચાણ",
    forecastRatio: "સરેરાશ સામે અંદાજ",
    dailyExpense: "અન્ય દૈનિક ખર્ચ (₹)",
    grossRevenue: "નોંધેલી વસ્તુઓનું વેચાણ",
    itemCost: "નોંધેલી વસ્તુઓનો ખર્ચ",
    grossProfit: "કુલ નફો",
    netProfit: "નોંધેલા ખર્ચ પછીનો નફો",
    goodSign: "તમારા અંદાજની સામે સારો સંકેત",
    belowForecast: "તમારા અંદાજ કરતાં થોડું ઓછું",
    tryAnotherSpot: "બીજી જગ્યાએ અજમાવવાનું વિચારો",
  },
  Bengali: {
    groundTitle: "মাঠপর্যায়ের তথ্য কিট",
    groundNote: "স্থানীয় পর্যবেক্ষণ লিখুন। ক্রেতা হওয়ার হার পরিকল্পনার অনুমান, ফলাফলের নিশ্চয়তা নয়।",
    peopleCount: "যাতায়াত করা মানুষ",
    minutesCounted: "গণনার মিনিট",
    sellingHours: "প্রতিদিন বিক্রির পরিকল্পিত ঘণ্টা",
    buyingRate: "আনুমানিক ক্রেতা (%)",
    estimateFootfall: "দৈনিক বিক্রির অনুমান",
    peoplePerHour: "প্রতি ঘণ্টায় মানুষ",
    estimatedUnits: "প্রতিদিনের আনুমানিক পণ্য",
    priceTitle: "কাছাকাছি দামের তথ্য",
    observedPrice: "অন্য দোকানে দেখা দাম (₹)",
    addPrice: "দেখা দাম যোগ করুন",
    checkedPrices: "নথিভুক্ত দাম",
    priceMedian: "নথিভুক্ত দামের মধ্যমা",
    proposedPrice: "আপনার পরিকল্পিত দাম",
    rent: "মাসিক ভাড়া (₹)",
    compareRent: "আনুমানিক বিক্রির সঙ্গে ভাড়ার তুলনা",
    rentShare: "আনুমানিক মাসিক বিক্রিতে ভাড়ার অংশ",
    rentNote: "৩০ দিনের অনুমানের ভিত্তিতে তুলনা; ভাড়ার কোনো সার্বজনীন নিরাপদ সীমা নেই।",
    pilotTitle: "৭ দিনের পাইলট খাতা",
    pilotNote: "সম্পন্ন দিনের প্রকৃত বিক্রি এবং জানা থাকলে অন্যান্য খরচ লিখুন। তথ্য এই ডিভাইসে সংরক্ষিত থাকবে।",
    targetUnits: "প্রতিদিনের পূর্বাভাস",
    dayUnits: "বিক্রি হওয়া পণ্য",
    evaluatePilot: "পাইলটের ফল দেখুন",
    daysRecorded: "নথিভুক্ত দিন",
    averageSales: "প্রতিদিনের গড় বিক্রি",
    forecastRatio: "গড় বনাম পূর্বাভাস",
    dailyExpense: "অন্যান্য দৈনিক খরচ (₹)",
    grossRevenue: "নথিভুক্ত পণ্যের বিক্রি",
    itemCost: "নথিভুক্ত পণ্যের খরচ",
    grossProfit: "মোট লাভ",
    netProfit: "লিখিত খরচের পর লাভ",
    goodSign: "আপনার পূর্বাভাসের তুলনায় ভালো লক্ষণ",
    belowForecast: "পূর্বাভাসের চেয়ে সামান্য কম",
    tryAnotherSpot: "অন্য জায়গায় পরীক্ষা করার কথা ভাবুন",
  },
};

type ChatResponse = {
  updated_state: VyaparState;
  response_text: string;
};

type MarketSample = {
  area: string;
  category: string;
  places_found: number;
  population: number;
  city_median_places_per_10000: number;
  supply_market: string;
  supply_distance_km: number;
  confidence: string;
  places_per_10000: number;
  gap_fraction: number;
  label: string;
};

type RushSample = {
  station: string;
  day_type: string;
  working_hours: string;
  hourly_rush_index: Record<string, number>;
  confidence: string;
};

type CityMarketData = {
  city: City;
  areas: string[];
  map_available: boolean;
  market_samples: MarketSample[];
  rush_samples: RushSample[];
  confidence: string;
};

type RushResult = {
  hourly_index: Record<string, number>;
  best_start_hour: number;
  best_end_hour: number;
  average_rush_index: number;
};

type WeatherResult = {
  timezone: string | null;
  hourly: Array<{
    time: string;
    temperature_celsius: number;
    precipitation_probability: number;
    advice: "rain" | "heat" | "normal";
  }>;
  confidence: string;
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
  const [marketData, setMarketData] = useState<CityMarketData | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("fast_food");
  const [rushResult, setRushResult] = useState<RushResult | null>(null);
  const [rushError, setRushError] = useState("");
  const [weatherResult, setWeatherResult] = useState<WeatherResult | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [businessTemplates, setBusinessTemplates] = useState<BusinessTemplate[]>([]);
  const [financeInputs, setFinanceInputs] = useState<MoneyInputs>({
    businessId: "",
    sellingPrice: "",
    unitCost: "",
    startupCost: "",
    fixedCosts: "",
    availableCapital: "",
    dailyUnits: "",
    annualRate: "12",
    termMonths: "12",
  });
  const [financeResult, setFinanceResult] = useState<FinanceResult | null>(null);
  const [moneyError, setMoneyError] = useState("");
  const [recipeCosts, setRecipeCosts] = useState<Array<{ name: string; cost: number }> | null>(null);
  const [specialCategories, setSpecialCategories] = useState<string[]>([]);
  const [schemeMatches, setSchemeMatches] = useState<SchemeMatch[]>([]);
  const [schemeSearchDone, setSchemeSearchDone] = useState(false);
  const [licences, setLicences] = useState<LicenceItem[]>([]);
  const [completedLicences, setCompletedLicences] = useState<Record<string, boolean>>({});
  const [supplierInputs, setSupplierInputs] = useState({
    supplier: "",
    quantity: "1",
    unitPrice: "",
    transport: "0",
    charges: "0",
  });
  const [supplierQuotes, setSupplierQuotes] = useState<SupplierQuote[]>([]);
  const [moneyLoading, setMoneyLoading] = useState(false);
  const [groundInputs, setGroundInputs] = useState<GroundInputs>({
    peopleCount: "",
    minutesCounted: "10",
    sellingHours: "",
    buyingRate: "1.5",
    observedPrice: "",
    monthlyRent: "",
  });
  const [priceChecks, setPriceChecks] = useState<number[]>([]);
  const [footfallResult, setFootfallResult] = useState<FootfallResult | null>(null);
  const [rentBurdenResult, setRentBurdenResult] = useState<RentBurdenResult | null>(null);
  const [pilotInputs, setPilotInputs] = useState<PilotInputs>({
    forecast: "",
    dailySales: ["", "", "", "", "", "", ""],
    dailyExpenses: ["", "", "", "", "", "", ""],
  });
  const [pilotResult, setPilotResult] = useState<PilotResult | null>(null);
  const [groundError, setGroundError] = useState("");
  const [groundLoading, setGroundLoading] = useState(false);
  const t = copy[language];
  const money = moneyCopy[language];
  const ground = groundCopy[language];
  const wantsLoan = vyaparState.user_profile.loan_needed;

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as {
          language?: string;
          activeScreen?: Screen;
          messages?: ChatMessage[];
          vyaparState?: Partial<VyaparState>;
          financeInputs?: MoneyInputs;
          financeResult?: FinanceResult | null;
          supplierQuotes?: SupplierQuote[];
          completedLicences?: Record<string, boolean>;
          groundInputs?: GroundInputs;
          priceChecks?: number[];
          footfallResult?: FootfallResult | null;
          rentBurdenResult?: RentBurdenResult | null;
          pilotInputs?: PilotInputs;
          pilotResult?: PilotResult | null;
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
        if (parsed.activeScreen && ["home", "advisor", "market", "time", "money", "plan"].includes(parsed.activeScreen)) {
          setActiveScreen(parsed.activeScreen);
        }
        if (parsed.financeInputs) setFinanceInputs(parsed.financeInputs);
        if (parsed.financeResult) setFinanceResult(parsed.financeResult);
        if (parsed.supplierQuotes) setSupplierQuotes(parsed.supplierQuotes);
        if (parsed.completedLicences) setCompletedLicences(parsed.completedLicences);
        if (parsed.groundInputs) setGroundInputs(parsed.groundInputs);
        if (parsed.priceChecks) setPriceChecks(parsed.priceChecks);
        if (parsed.footfallResult) setFootfallResult(parsed.footfallResult);
        if (parsed.rentBurdenResult) setRentBurdenResult(parsed.rentBurdenResult);
        if (parsed.pilotInputs) {
          setPilotInputs({
            forecast: parsed.pilotInputs.forecast ?? "",
            dailySales: Array.from({ length: 7 }, (_, index) => parsed.pilotInputs?.dailySales[index] ?? ""),
            dailyExpenses: Array.from({ length: 7 }, (_, index) => parsed.pilotInputs?.dailyExpenses?.[index] ?? ""),
          });
        }
        if (parsed.pilotResult) setPilotResult(parsed.pilotResult);
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
      financeInputs,
      financeResult,
      supplierQuotes,
      completedLicences,
      groundInputs,
      priceChecks,
      footfallResult,
      rentBurdenResult,
      pilotInputs,
      pilotResult,
    }));
  }, [
    activeScreen,
    completedLicences,
    financeInputs,
    financeResult,
    footfallResult,
    groundInputs,
    isHydrated,
    language,
    messages,
    pilotInputs,
    pilotResult,
    priceChecks,
    rentBurdenResult,
    supplierQuotes,
    vyaparState,
  ]);

  useEffect(() => {
    if (!isHydrated || activeScreen !== "money" || businessTemplates.length > 0) return;
    let active = true;
    axios.get<{ business_templates: BusinessTemplate[] }>(`${apiBaseUrl}/api/city/business-templates`)
      .then((response) => {
        if (!active) return;
        const templates = response.data.business_templates;
        setBusinessTemplates(templates);
        const businessName = vyaparState.business_context.business_name?.toLowerCase();
        const matchingTemplate = templates.find((template) =>
          template.id === vyaparState.business_context.category ||
          template.name.toLowerCase() === businessName,
        );
        if (matchingTemplate && !financeInputs.businessId) {
          setFinanceInputs((previous) => ({
            ...previous,
            businessId: matchingTemplate.id,
            sellingPrice: previous.sellingPrice || String(matchingTemplate.selling_price),
            unitCost: previous.unitCost || (matchingTemplate.unit_cost === null ? "" : String(matchingTemplate.unit_cost)),
            startupCost: previous.startupCost || String(matchingTemplate.startup_cost),
            fixedCosts: previous.fixedCosts || (matchingTemplate.fixed_monthly_cost === undefined ? "" : String(matchingTemplate.fixed_monthly_cost)),
            availableCapital: previous.availableCapital || String(vyaparState.user_profile.available_capital ?? ""),
          }));
        }
      })
      .catch(() => {
        if (active) setMoneyError(money.error);
      });
    return () => {
      active = false;
    };
  }, [
    activeScreen,
    businessTemplates.length,
    financeInputs.businessId,
    isHydrated,
    money.error,
    vyaparState.business_context.business_name,
    vyaparState.business_context.category,
    vyaparState.user_profile.available_capital,
  ]);

  useEffect(() => {
    if (activeScreen !== "market" && activeScreen !== "time") return;
    let active = true;
    setMarketLoading(true);
    setMarketError("");
    setMarketData(null);
    setRushResult(null);
    setRushError("");

    axios.get<CityMarketData>(`${apiBaseUrl}/api/city/market-data`, {
      params: { city: vyaparState.user_profile.city },
    }).then((response) => {
      if (active) setMarketData(response.data);
    }).catch(() => {
      if (active) setMarketError(t.connection);
    }).finally(() => {
      if (active) setMarketLoading(false);
    });

    return () => {
      active = false;
    };
  }, [activeScreen, t.connection, vyaparState.user_profile.city]);

  useEffect(() => {
    const sample = marketData?.rush_samples[0];
    if (activeScreen !== "time" || !sample) return;
    let active = true;
    axios.post<RushResult>(`${apiBaseUrl}/api/city/rush-clock`, {
      hourly_rush_index: sample.hourly_rush_index,
      working_hours: vyaparState.user_profile.working_hours ?? sample.working_hours,
    }).then((response) => {
      if (active) setRushResult(response.data);
    }).catch(() => {
      if (active) setRushError(t.noCategorySample);
    });
    return () => {
      active = false;
    };
  }, [activeScreen, marketData, t.noCategorySample, vyaparState.user_profile.working_hours]);

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
  const selectedMarketSample = marketData?.market_samples.find(
    (sample) => sample.category === selectedCategory,
  );
  const sortedObservedPrices = [...priceChecks].sort((a, b) => a - b);
  const observedPriceMedian = sortedObservedPrices.length === 0
    ? null
    : sortedObservedPrices.length % 2 === 0
      ? (sortedObservedPrices[sortedObservedPrices.length / 2 - 1] + sortedObservedPrices[sortedObservedPrices.length / 2]) / 2
      : sortedObservedPrices[Math.floor(sortedObservedPrices.length / 2)];
  const pilotVerdictText = pilotResult?.verdict === "good sign"
    ? ground.goodSign
    : pilotResult?.verdict === "slightly below forecast"
      ? ground.belowForecast
      : ground.tryAnotherSpot;
  const rushSample = marketData?.rush_samples[0];
  const upcomingWeather = weatherResult?.hourly.slice(new Date().getHours(), new Date().getHours() + 6) ?? [];
  const weatherAlert = upcomingWeather.find((forecast) => forecast.advice !== "normal");
  const weatherAdviceText = weatherAlert?.advice === "rain"
    ? t.rainAdvice
    : weatherAlert?.advice === "heat"
      ? t.heatAdvice
      : t.normalAdvice;

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

  const requestWeather = () => {
    setWeatherError("");
    setWeatherResult(null);
    if (!navigator.geolocation) {
      setWeatherError(t.weatherError);
      return;
    }
    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await axios.get<WeatherResult>(`${apiBaseUrl}/api/city/weather`, {
            params: { latitude: coords.latitude, longitude: coords.longitude },
          });
          setWeatherResult(response.data);
        } catch {
          setWeatherError(t.weatherError);
        } finally {
          setWeatherLoading(false);
        }
      },
      () => {
        setWeatherError(t.weatherError);
        setWeatherLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 3600000 },
    );
  };

  const formatRupees = (amount: number) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

  const chooseBusinessTemplate = (businessId: string) => {
    const template = businessTemplates.find((item) => item.id === businessId);
    setFinanceInputs((previous) => ({
      ...previous,
      businessId,
      sellingPrice: template ? String(template.selling_price) : "",
      unitCost: template?.unit_cost === null || !template ? "" : String(template.unit_cost),
      startupCost: template ? String(template.startup_cost) : "",
      fixedCosts: template?.fixed_monthly_cost === undefined ? "" : String(template.fixed_monthly_cost),
      availableCapital: String(vyaparState.user_profile.available_capital ?? ""),
    }));
    setFinanceResult(null);
    setSchemeMatches([]);
    setSchemeSearchDone(false);
    setLicences([]);
    setRecipeCosts(null);
    setMoneyError("");
  };

  const calculateSampleRecipe = async () => {
    const template = businessTemplates.find((item) => item.id === financeInputs.businessId);
    if (!template?.recipe) return;
    setMoneyLoading(true);
    setMoneyError("");
    try {
      const response = await axios.post<{ unit_cost: number; items: Array<{ name: string; cost: number }> }>(
        `${apiBaseUrl}/api/city/unit-cost`,
        { ingredients: template.recipe },
      );
      setFinanceInputs((previous) => ({ ...previous, unitCost: String(response.data.unit_cost) }));
      setRecipeCosts(response.data.items);
    } catch {
      setMoneyError(money.error);
    } finally {
      setMoneyLoading(false);
    }
  };

  const calculateMoneyPlan = async () => {
    const values = {
      selling_price: Number(financeInputs.sellingPrice),
      unit_cost: Number(financeInputs.unitCost),
      fixed_monthly_cost: Number(financeInputs.fixedCosts),
      startup_cost: Number(financeInputs.startupCost),
      available_capital: Number(financeInputs.availableCapital),
      daily_units: Number(financeInputs.dailyUnits || 0),
      annual_interest_rate: Number(financeInputs.annualRate),
      loan_term_months: Number(financeInputs.termMonths),
    };
    const requiredFields = [
      financeInputs.sellingPrice,
      financeInputs.unitCost,
      financeInputs.startupCost,
      financeInputs.fixedCosts,
      financeInputs.availableCapital,
      financeInputs.annualRate,
      financeInputs.termMonths,
    ];
    if (!financeInputs.businessId || requiredFields.some((value) => !value.trim()) ||
      Object.values(values).some((value) => !Number.isFinite(value) || value < 0)) {
      setMoneyError(money.error);
      return;
    }
    setMoneyLoading(true);
    setMoneyError("");
    try {
      const response = await axios.post<FinanceResult>(`${apiBaseUrl}/api/city/finance`, values);
      const result = response.data;
      setFinanceResult(result);
      const template = businessTemplates.find((item) => item.id === financeInputs.businessId);
      setVyaparState((previous) => ({
        ...previous,
        user_profile: { ...previous.user_profile, available_capital: values.available_capital },
        business_context: {
          ...previous.business_context,
          category: financeInputs.businessId,
          business_name: template?.name ?? previous.business_context.business_name,
          additional_details: {
            ...previous.business_context.additional_details,
            business_model: template?.model,
          },
        },
        financial_evaluation: {
          ...previous.financial_evaluation,
          total_project_cost: values.startup_cost + values.fixed_monthly_cost,
          startup_cost: values.startup_cost,
          unit_cost: values.unit_cost,
          selling_price: values.selling_price,
          fixed_monthly_cost: values.fixed_monthly_cost,
          expected_daily_units: values.daily_units,
          funding_gap: result.funding_gap,
          loan_required: result.loan_required,
          estimated_monthly_emi: result.monthly_emi,
          estimated_monthly_profit: result.estimated_monthly_profit,
          break_even_units_per_day: result.break_even_units_per_day,
        },
      }));
      setSchemeMatches([]);
      setSchemeSearchDone(false);
    } catch {
      setMoneyError(money.error);
    } finally {
      setMoneyLoading(false);
    }
  };

  const findSchemeMatches = async () => {
    const template = businessTemplates.find((item) => item.id === financeInputs.businessId);
    if (!template || !financeResult || wantsLoan !== true) return;
    setMoneyLoading(true);
    setMoneyError("");
    try {
      const response = await axios.post<{ schemes: SchemeMatch[] }>(`${apiBaseUrl}/api/city/schemes`, {
        business_model: template.model,
        funding_gap: financeResult.funding_gap,
        wants_loan: true,
        special_categories: specialCategories,
      });
      setSchemeMatches(response.data.schemes);
      setSchemeSearchDone(true);
    } catch {
      setMoneyError(money.error);
    } finally {
      setMoneyLoading(false);
    }
  };

  const loadLicenceChecklist = async () => {
    const template = businessTemplates.find((item) => item.id === financeInputs.businessId);
    if (!template) return;
    setMoneyLoading(true);
    setMoneyError("");
    try {
      const response = await axios.post<{ licences: LicenceItem[] }>(`${apiBaseUrl}/api/city/licences`, {
        business_id: template.id,
        business_model: template.model,
      });
      setLicences(response.data.licences);
    } catch {
      setMoneyError(money.error);
    } finally {
      setMoneyLoading(false);
    }
  };

  const addSupplierQuote = async () => {
    const quantity = Number(supplierInputs.quantity);
    const unitPrice = Number(supplierInputs.unitPrice);
    const transport = Number(supplierInputs.transport);
    const charges = Number(supplierInputs.charges);
    if (!supplierInputs.supplier.trim() || !Number.isFinite(quantity) || quantity <= 0 ||
      !Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isFinite(transport) || transport < 0 ||
      !Number.isFinite(charges) || charges < 0) {
      setMoneyError(money.error);
      return;
    }
    setMoneyLoading(true);
    setMoneyError("");
    try {
      const response = await axios.post<{ landed_cost_per_unit: number }>(
        `${apiBaseUrl}/api/city/landed-cost`,
        { unit_price: unitPrice, quantity, transport_cost: transport, other_charges: charges },
      );
      setSupplierQuotes((previous) => [
        ...previous,
        { supplier: supplierInputs.supplier.trim(), landedCost: response.data.landed_cost_per_unit },
      ].sort((a, b) => a.landedCost - b.landedCost));
      setSupplierInputs({ supplier: "", quantity: "1", unitPrice: "", transport: "0", charges: "0" });
    } catch {
      setMoneyError(money.error);
    } finally {
      setMoneyLoading(false);
    }
  };

  const estimateFootfallSales = async () => {
    const peopleCount = Number(groundInputs.peopleCount);
    const minutes = Number(groundInputs.minutesCounted);
    const sellingHours = Number(groundInputs.sellingHours);
    const buyingRate = Number(groundInputs.buyingRate) / 100;
    if ([groundInputs.peopleCount, groundInputs.minutesCounted, groundInputs.sellingHours, groundInputs.buyingRate]
      .some((value) => !value.trim()) ||
      [peopleCount, minutes, sellingHours, buyingRate].some((value) => !Number.isFinite(value) || value < 0) ||
      minutes === 0 || sellingHours === 0 || buyingRate > 1) {
      setGroundError(money.error);
      return;
    }
    setGroundLoading(true);
    setGroundError("");
    try {
      const response = await axios.post<FootfallResult>(`${apiBaseUrl}/api/city/footfall-forecast`, {
        people_count: peopleCount,
        minutes_counted: minutes,
        selling_hours: sellingHours,
        buying_rate: buyingRate,
      });
      setFootfallResult(response.data);
      setRentBurdenResult(null);
    } catch {
      setGroundError(money.error);
    } finally {
      setGroundLoading(false);
    }
  };

  const addObservedPrice = () => {
    const price = Number(groundInputs.observedPrice);
    if (!groundInputs.observedPrice.trim() || !Number.isFinite(price) || price <= 0) {
      setGroundError(money.error);
      return;
    }
    setPriceChecks((previous) => [...previous, price]);
    setGroundInputs((previous) => ({ ...previous, observedPrice: "" }));
    setGroundError("");
  };

  const compareRentWithSales = async () => {
    const monthlyRent = Number(groundInputs.monthlyRent);
    const dailyUnits = footfallResult?.estimated_units_per_day ?? Number(financeInputs.dailyUnits);
    const sellingPrice = Number(financeInputs.sellingPrice);
    if (!groundInputs.monthlyRent.trim() || !Number.isFinite(monthlyRent) || monthlyRent < 0 ||
      !Number.isFinite(dailyUnits) || dailyUnits < 0 ||
      !financeInputs.sellingPrice.trim() || !Number.isFinite(sellingPrice) || sellingPrice < 0) {
      setGroundError(money.error);
      return;
    }
    setGroundLoading(true);
    setGroundError("");
    try {
      const response = await axios.post<RentBurdenResult>(`${apiBaseUrl}/api/city/rent-burden`, {
        monthly_rent: monthlyRent,
        estimated_daily_units: dailyUnits,
        selling_price: sellingPrice,
      });
      setRentBurdenResult(response.data);
    } catch {
      setGroundError(money.error);
    } finally {
      setGroundLoading(false);
    }
  };

  const reviewPilot = async () => {
    const recordedDays = pilotInputs.dailySales
      .map((value, index) => ({ value, index }))
      .filter((day) => day.value.trim());
    const sales = recordedDays.map((day) => Number(day.value));
    const fallbackForecast = footfallResult?.estimated_units_per_day ?? Number(financeInputs.dailyUnits);
    const forecast = Number(pilotInputs.forecast || fallbackForecast);
    if (sales.length === 0 || sales.some((value) => !Number.isFinite(value) || value < 0) ||
      !Number.isFinite(forecast) || forecast <= 0) {
      setGroundError(money.error);
      return;
    }
    const expenseEntries = recordedDays.map((day) => pilotInputs.dailyExpenses[day.index]);
    const enteredExpenseCount = expenseEntries.filter((value) => value.trim()).length;
    if (enteredExpenseCount > 0 && enteredExpenseCount !== recordedDays.length) {
      setGroundError(money.error);
      return;
    }
    const dailyExpenses = enteredExpenseCount === recordedDays.length
      ? expenseEntries.map(Number)
      : undefined;
    if (dailyExpenses?.some((value) => !Number.isFinite(value) || value < 0)) {
      setGroundError(money.error);
      return;
    }
    const hasPriceData = Boolean(financeInputs.sellingPrice.trim() || financeInputs.unitCost.trim());
    const sellingPrice = Number(financeInputs.sellingPrice);
    const unitCost = Number(financeInputs.unitCost);
    if (hasPriceData && (!financeInputs.sellingPrice.trim() || !financeInputs.unitCost.trim() ||
      !Number.isFinite(sellingPrice) || sellingPrice < 0 || !Number.isFinite(unitCost) || unitCost < 0)) {
      setGroundError(money.error);
      return;
    }
    setGroundLoading(true);
    setGroundError("");
    try {
      const response = await axios.post<PilotResult>(`${apiBaseUrl}/api/city/pilot`, {
        sales_by_day: sales,
        forecast_units_per_day: forecast,
        ...(hasPriceData ? { selling_price: sellingPrice, unit_cost: unitCost } : {}),
        ...(dailyExpenses ? { daily_expenses: dailyExpenses } : {}),
      });
      setPilotResult(response.data);
    } catch {
      setGroundError(money.error);
    } finally {
      setGroundLoading(false);
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
        ["time", "schedule", t.timeTitle],
        ["money", "payments", money.navLabel],
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
          <h1 className="text-2xl font-bold">{t.marketTitle} · {vyaparState.user_profile.city}</h1>
          <p className="mt-2 text-sm text-outline">{t.marketMessage}</p>
          <label htmlFor="market-category" className="mb-2 mt-5 block text-sm font-bold">{t.category}</label>
          <select
            id="market-category"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3"
          >
            <option value="fast_food">{t.fastFood}</option>
            <option value="chai">Chai</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="tailor">Tailor</option>
            <option value="phone_repair">Phone repair</option>
          </select>

          {marketLoading && <p className="mt-4 text-sm text-outline" role="status">{t.weatherLoading}</p>}
          {marketError && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800" role="alert">{marketError}</p>}
          {selectedMarketSample && (
            <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{selectedMarketSample.area}</h2>
                  <p className="mt-1 text-xs text-outline">{selectedMarketSample.confidence}</p>
                </div>
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-800">{selectedMarketSample.label}</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-surface-container-low p-3">
                  <dt className="text-xs text-outline">{t.placesFound}</dt>
                  <dd className="mt-1 font-bold">{selectedMarketSample.places_found}</dd>
                </div>
                <div className="rounded-xl bg-surface-container-low p-3">
                  <dt className="text-xs text-outline">{t.population}</dt>
                  <dd className="mt-1 font-bold">{selectedMarketSample.population.toLocaleString()}</dd>
                </div>
                <div className="rounded-xl bg-surface-container-low p-3">
                  <dt className="text-xs text-outline">{t.placesPerTenThousand}</dt>
                  <dd className="mt-1 font-bold">{selectedMarketSample.places_per_10000}</dd>
                </div>
                <div className="rounded-xl bg-surface-container-low p-3">
                  <dt className="text-xs text-outline">{t.cityMedian}</dt>
                  <dd className="mt-1 font-bold">{selectedMarketSample.city_median_places_per_10000}</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm text-outline">{t.verifyGround}</p>
            </section>
          )}
          {marketData && !selectedMarketSample && (
            <p className="mt-4 rounded-xl bg-surface-container-low p-4 text-sm text-outline">{t.noCategorySample}</p>
          )}
          {marketData && (
            <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4">
              <h2 className="font-bold">{t.chooseCity}: {marketData.city}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {marketData.areas.map((area) => (
                  <span key={area} className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs">{area}</span>
                ))}
              </div>
              {!marketData.map_available && <p className="mt-3 text-xs text-outline">{t.mapUnavailable}</p>}
            </section>
          )}
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{t.sampleNotice}</p>
          <BottomNav />
        </div>
      )}

      {activeScreen === "time" && (
        <div className="min-h-screen px-5 pb-28 pt-24">
          <TopAppBar title={t.timeTitle} />
          <h1 className="text-2xl font-bold">{t.timeTitle}</h1>
          {marketLoading && <p className="mt-4 text-sm text-outline" role="status">{t.weatherLoading}</p>}
          {marketError && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800" role="alert">{marketError}</p>}
          {rushSample && (
            <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm">
              <div className="flex justify-between gap-3">
                <div>
                  <h2 className="font-bold">{rushSample.station}</h2>
                  <p className="text-xs text-outline">{rushSample.day_type} · {rushSample.confidence}</p>
                </div>
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-800">{rushSample.confidence}</span>
              </div>
              <div className="mt-5 flex h-28 items-end gap-3">
                {Object.entries(rushSample.hourly_rush_index).map(([hour, value]) => (
                  <div key={hour} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div className="w-full rounded-t-lg bg-primary-container" style={{ height: `${Math.max(value, 6)}%` }} aria-label={`${hour}:00 ${value}`} />
                    <span className="text-[10px] text-outline">{hour}:00</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-primary/5 p-3">
                <p className="text-xs text-outline">{t.bestWindow}</p>
                {rushResult ? (
                  <p className="mt-1 font-bold">{String(rushResult.best_start_hour).padStart(2, "0")}:00–{String(rushResult.best_end_hour).padStart(2, "0")}:00 · {rushResult.average_rush_index}/100</p>
                ) : (
                  <p className="mt-1 text-sm text-outline">{rushError || t.noCategorySample}</p>
                )}
              </div>
            </section>
          )}
          {marketData && !rushSample && <p className="mt-4 rounded-xl bg-surface-container-low p-4 text-sm text-outline">{t.noCategorySample}</p>}

          <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">partly_cloudy_day</span>
              <h2 className="font-bold">{t.weatherTitle}</h2>
            </div>
            <p className="mt-2 text-xs text-outline">{t.weatherLocation}</p>
            <button type="button" onClick={requestWeather} disabled={weatherLoading} className="mt-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {weatherLoading ? t.weatherLoading : t.weatherButton}
            </button>
            {weatherError && <p className="mt-3 text-sm text-rose-700" role="alert">{weatherError}</p>}
            {weatherResult && (
              <>
                <p className="mt-3 rounded-xl bg-surface-container-low p-3 text-sm">{weatherAdviceText}</p>
                <ul className="mt-3 grid grid-cols-3 gap-2">
                  {upcomingWeather.slice(0, 3).map((forecast) => (
                    <li key={forecast.time} className="rounded-xl bg-surface-container-low p-2 text-center text-xs">
                      <span className="block font-bold">{forecast.time.slice(11, 16)}</span>
                      <span>{Math.round(forecast.temperature_celsius)}° · {forecast.precipitation_probability}%</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm">
            <h2 className="font-bold">{ground.groundTitle}</h2>
            <p className="mt-2 text-xs leading-relaxed text-outline">{ground.groundNote}</p>
            <p className="mt-2 text-xs font-semibold text-outline">
              {t.city}: {vyaparState.user_profile.city}
              {vyaparState.business_context.candidate_zones.length > 0 &&
                ` · ${vyaparState.business_context.candidate_zones.join(", ")}`}
            </p>
            {groundError && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800" role="alert">{groundError}</p>}

            <div className="mt-4 grid grid-cols-2 gap-3">
              {([
                ["peopleCount", ground.peopleCount],
                ["minutesCounted", ground.minutesCounted],
                ["sellingHours", ground.sellingHours],
                ["buyingRate", ground.buyingRate],
              ] as const).map(([field, label]) => (
                <label key={field} className="text-xs font-semibold text-outline">
                  {label}
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={groundInputs[field]}
                    onChange={(event) => {
                      setGroundInputs((previous) => ({ ...previous, [field]: event.target.value }));
                      setFootfallResult(null);
                      setRentBurdenResult(null);
                    }}
                    className="mt-1 w-full rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm font-normal text-on-surface"
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void estimateFootfallSales()}
              disabled={groundLoading}
              className="mt-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >{groundLoading ? money.loading : ground.estimateFootfall}</button>
            {footfallResult && (
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-surface-container-low p-3">
                  <dt className="text-xs text-outline">{ground.peoplePerHour}</dt>
                  <dd className="mt-1 font-bold">{footfallResult.people_per_hour}</dd>
                </div>
                <div className="rounded-xl bg-surface-container-low p-3">
                  <dt className="text-xs text-outline">{ground.estimatedUnits}</dt>
                  <dd className="mt-1 font-bold">{footfallResult.estimated_units_per_day}</dd>
                </div>
              </dl>
            )}

            <div className="mt-5 border-t border-outline-variant/50 pt-4">
              <h3 className="text-sm font-bold">{ground.priceTitle}</h3>
              <label className="mt-3 block text-xs font-semibold text-outline">
                {ground.observedPrice}
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={groundInputs.observedPrice}
                  onChange={(event) => setGroundInputs((previous) => ({ ...previous, observedPrice: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm font-normal text-on-surface"
                />
              </label>
              <button
                type="button"
                onClick={addObservedPrice}
                className="mt-2 rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary"
              >{ground.addPrice}</button>
              {priceChecks.length > 0 && (
                <div className="mt-3 rounded-xl bg-surface-container-low p-3 text-sm">
                  <p>{ground.checkedPrices}: {sortedObservedPrices.map(formatRupees).join(" · ")}</p>
                  {observedPriceMedian !== null && (
                    <p className="mt-1 font-bold">{ground.priceMedian}: {formatRupees(observedPriceMedian)}</p>
                  )}
                  {financeInputs.sellingPrice && (
                    <p className="mt-1 text-xs text-outline">
                      {ground.proposedPrice}: {formatRupees(Number(financeInputs.sellingPrice))}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-outline-variant/50 pt-4">
              <label className="block text-xs font-semibold text-outline">
                {ground.rent}
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={groundInputs.monthlyRent}
                  onChange={(event) => {
                    setGroundInputs((previous) => ({ ...previous, monthlyRent: event.target.value }));
                    setRentBurdenResult(null);
                  }}
                  className="mt-1 w-full rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm font-normal text-on-surface"
                />
              </label>
              <button
                type="button"
                onClick={() => void compareRentWithSales()}
                disabled={groundLoading}
                className="mt-2 rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50"
              >{groundLoading ? money.loading : ground.compareRent}</button>
              <p className="mt-2 text-xs text-outline">{ground.rentNote}</p>
              {rentBurdenResult && (
                <dl className="mt-3 space-y-2 rounded-xl bg-surface-container-low p-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt>{ground.rentShare}</dt>
                    <dd className="font-bold">{rentBurdenResult.rent_share_percent === null ? "—" : `${rentBurdenResult.rent_share_percent}%`}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>{ground.estimatedUnits}</dt>
                    <dd>{formatRupees(rentBurdenResult.estimated_monthly_sales)}</dd>
                  </div>
                </dl>
              )}
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4">
            <h2 className="font-bold">{t.cityPulse}</h2>
            <p className="mt-2 text-sm text-outline">{t.noNews}</p>
          </section>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{t.sampleNotice}</p>
          <BottomNav />
        </div>
      )}

      {activeScreen === "money" && (
        <div className="min-h-screen px-5 pb-28 pt-24">
          <TopAppBar title={money.title} />
          <h1 className="text-2xl font-bold">{money.title}</h1>
          <p className="mt-2 text-sm text-outline">{t.sampleNotice}</p>
          {moneyError && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800" role="alert">{moneyError}</p>}

          <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm">
            <label htmlFor="money-business" className="block text-sm font-bold">{money.selectBusiness}</label>
            <select
              id="money-business"
              value={financeInputs.businessId}
              onChange={(event) => chooseBusinessTemplate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-outline-variant bg-white px-3 py-2.5"
            >
              <option value="">{t.category}</option>
              {businessTemplates.map((template) => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>

            {businessTemplates.length === 0 && !moneyError && (
              <p className="mt-3 text-sm text-outline" role="status">{money.loading}</p>
            )}
            {businessTemplates.find((template) => template.id === financeInputs.businessId)?.recipe && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => void calculateSampleRecipe()}
                  disabled={moneyLoading}
                  className="rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50"
                >
                  {money.useRecipe}
                </button>
                {recipeCosts && (
                  <ul className="mt-2 space-y-1 text-xs text-outline">
                    {recipeCosts.map((item) => (
                      <li key={item.name} className="flex justify-between gap-2">
                        <span>{item.name}</span><span>{formatRupees(item.cost)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              {([
                ["sellingPrice", money.sellingPrice],
                ["unitCost", money.unitCost],
                ["startupCost", money.startupCost],
                ["fixedCosts", money.fixedCosts],
                ["availableCapital", money.availableCapital],
                ["dailyUnits", money.dailyUnits],
                ["annualRate", money.annualRate],
                ["termMonths", money.termMonths],
              ] as const).map(([field, label]) => (
                <label key={field} className="text-xs font-semibold text-outline">
                  {label}
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={financeInputs[field]}
                    onChange={(event) => setFinanceInputs((previous) => ({
                      ...previous,
                      [field]: event.target.value,
                    }))}
                    className="mt-1 w-full rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm font-normal text-on-surface"
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void calculateMoneyPlan()}
              disabled={moneyLoading || !financeInputs.businessId}
              className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {moneyLoading ? money.loading : money.calculate}
            </button>
          </section>

          {financeResult && (
            <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm">
              <h2 className="font-bold">{money.title}</h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-surface-container-low p-3">
                  <dt className="text-xs text-outline">{money.margin}</dt>
                  <dd className="mt-1 font-bold">{formatRupees(financeResult.margin_per_unit)}</dd>
                </div>
                <div className="rounded-xl bg-surface-container-low p-3">
                  <dt className="text-xs text-outline">{money.breakEven}</dt>
                  <dd className="mt-1 font-bold">{financeResult.break_even_units_per_day ?? "—"}</dd>
                </div>
                <div className="rounded-xl bg-surface-container-low p-3">
                  <dt className="text-xs text-outline">{money.monthlyProfit}</dt>
                  <dd className="mt-1 font-bold">{formatRupees(financeResult.estimated_monthly_profit)}</dd>
                </div>
                <div className="rounded-xl bg-surface-container-low p-3">
                  <dt className="text-xs text-outline">{money.fundingGap}</dt>
                  <dd className="mt-1 font-bold">{formatRupees(financeResult.funding_gap)}</dd>
                </div>
                <div className="col-span-2 rounded-xl bg-primary/5 p-3">
                  <dt className="text-xs text-outline">{money.emi}</dt>
                  <dd className="mt-1 font-bold">{formatRupees(financeResult.monthly_emi)}</dd>
                </div>
              </dl>
            </section>
          )}

          <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm">
            <h2 className="font-bold">{money.loanOptions}</h2>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <button
                type="button"
                aria-pressed={wantsLoan === true}
                onClick={() => {
                  setSchemeMatches([]);
                  setSchemeSearchDone(false);
                  setVyaparState((previous) => ({
                    ...previous,
                    user_profile: { ...previous.user_profile, loan_needed: true },
                  }));
                }}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${wantsLoan === true ? "border-primary bg-primary/5 text-primary" : "border-outline-variant"}`}
              >{money.wantsLoan}</button>
              <button
                type="button"
                aria-pressed={wantsLoan === false}
                onClick={() => {
                  setSchemeMatches([]);
                  setSchemeSearchDone(false);
                  setVyaparState((previous) => ({
                    ...previous,
                    user_profile: { ...previous.user_profile, loan_needed: false },
                  }));
                }}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${wantsLoan === false ? "border-primary bg-primary/5 text-primary" : "border-outline-variant"}`}
              >{money.noLoan}</button>
            </div>
            {wantsLoan && (
              <>
                <fieldset className="mt-3">
                  <legend className="text-xs font-semibold text-outline">{money.specialCategory}</legend>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    {([["women", money.women], ["sc_st", money.scst]] as const).map(([category, label]) => (
                      <label key={category} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={specialCategories.includes(category)}
                          onChange={(event) => setSpecialCategories((previous) =>
                            event.target.checked
                              ? [...previous, category]
                              : previous.filter((item) => item !== category),
                          )}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <button
                  type="button"
                  onClick={() => void findSchemeMatches()}
                  disabled={moneyLoading || !financeResult}
                  className="mt-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >{money.findSchemes}</button>
                <p className="mt-3 text-xs leading-relaxed text-outline">{money.preliminary} {money.verify}</p>
                {schemeSearchDone && schemeMatches.length === 0 && financeResult && (
                  <p className="mt-3 text-sm text-outline">{money.noSchemes}</p>
                )}
                <div className="mt-3 space-y-3">
                  {schemeMatches.map((scheme) => (
                    <article key={scheme.id} className="rounded-xl border border-outline-variant/50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold">{scheme.name}</h3>
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900">
                          {scheme.match_label} · {scheme.match_percent}%
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-outline">{scheme.note}</p>
                      <ul className="mt-2 list-disc pl-5 text-xs text-outline">
                        {scheme.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                        {scheme.documents.map((document) => <li key={document}>{document}</li>)}
                      </ul>
                      {scheme.official_url && (
                        <a href={scheme.official_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-primary underline">
                          {scheme.name} · {money.verify}
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm">
            <h2 className="font-bold">{money.licences}</h2>
            <p className="mt-1 text-xs text-outline">{money.verify}</p>
            <button
              type="button"
              onClick={() => void loadLicenceChecklist()}
              disabled={moneyLoading || !financeInputs.businessId}
              className="mt-3 rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50"
            >{money.licences}</button>
            <ul className="mt-3 space-y-3">
              {licences.map((licence) => (
                <li key={licence.id} className="rounded-xl bg-surface-container-low p-3">
                  <label className="flex items-start gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={Boolean(completedLicences[licence.id])}
                      onChange={(event) => setCompletedLicences((previous) => ({
                        ...previous,
                        [licence.id]: event.target.checked,
                      }))}
                    />
                    <span>{licence.name}</span>
                  </label>
                  <p className="ml-6 mt-1 text-xs text-outline">{licence.where}. {licence.note}</p>
                  {licence.official_url && (
                    <a href={licence.official_url} target="_blank" rel="noopener noreferrer" className="ml-6 mt-1 inline-block text-xs font-semibold text-primary underline">
                      {money.verify}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm">
            <h2 className="font-bold">{money.landedTitle}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {([
                ["supplier", money.supplier],
                ["quantity", money.quantity],
                ["unitPrice", money.unitPrice],
                ["transport", money.transport],
                ["charges", money.charges],
              ] as const).map(([field, label]) => (
                <label key={field} className={`text-xs font-semibold text-outline ${field === "supplier" ? "col-span-2" : ""}`}>
                  {label}
                  <input
                    type={field === "supplier" ? "text" : "number"}
                    min={field === "quantity" ? "0.001" : "0"}
                    step="any"
                    value={supplierInputs[field]}
                    onChange={(event) => setSupplierInputs((previous) => ({
                      ...previous,
                      [field]: event.target.value,
                    }))}
                    className="mt-1 w-full rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm font-normal text-on-surface"
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void addSupplierQuote()}
              disabled={moneyLoading}
              className="mt-3 rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50"
            >{money.addSupplier}</button>
            <ul className="mt-3 space-y-2">
              {supplierQuotes.map((quote, index) => (
                <li key={`${quote.supplier}-${index}`} className="flex justify-between gap-3 rounded-xl bg-surface-container-low p-3 text-sm">
                  <span>{quote.supplier}</span>
                  <span className="text-right font-bold">{formatRupees(quote.landedCost)} / {money.perUnit}</span>
                </li>
              ))}
            </ul>
          </section>
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
            <button
              type="button"
              onClick={() => setActiveScreen("money")}
              className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white"
            >{money.title}</button>
          </section>
          {financeResult && (
            <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm">
              <h2 className="font-bold">{money.title}</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt>{money.fundingGap}</dt><dd className="font-bold">{formatRupees(financeResult.funding_gap)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{money.monthlyProfit}</dt><dd className="font-bold">{formatRupees(financeResult.estimated_monthly_profit)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{money.breakEven}</dt><dd className="font-bold">{financeResult.break_even_units_per_day ?? "—"}</dd>
                </div>
              </dl>
            </section>
          )}
          <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm">
            <h2 className="font-bold">{ground.pilotTitle}</h2>
            <p className="mt-2 text-xs leading-relaxed text-outline">{ground.pilotNote}</p>
            {groundError && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800" role="alert">{groundError}</p>}
            <label className="mt-3 block text-xs font-semibold text-outline">
              {ground.targetUnits}
              <input
                type="number"
                min="0"
                step="any"
                value={pilotInputs.forecast}
                placeholder={String(footfallResult?.estimated_units_per_day ?? financeInputs.dailyUnits)}
                onChange={(event) => {
                  setPilotInputs((previous) => ({ ...previous, forecast: event.target.value }));
                  setPilotResult(null);
                }}
                className="mt-1 w-full rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm font-normal text-on-surface"
              />
            </label>
            <div className="mt-3 space-y-3">
              {pilotInputs.dailySales.map((units, index) => (
                <div key={index} className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold text-outline">
                    {index + 1} · {ground.dayUnits}
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={units}
                      onChange={(event) => {
                        setPilotInputs((previous) => ({
                          ...previous,
                          dailySales: previous.dailySales.map((value, day) =>
                            day === index ? event.target.value : value,
                          ),
                        }));
                        setPilotResult(null);
                      }}
                      className="mt-1 w-full rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm font-normal text-on-surface"
                    />
                  </label>
                  <label className="text-xs font-semibold text-outline">
                    {ground.dailyExpense}
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={pilotInputs.dailyExpenses[index] ?? ""}
                      onChange={(event) => {
                        setPilotInputs((previous) => ({
                          ...previous,
                          dailyExpenses: previous.dailyExpenses.map((value, day) =>
                            day === index ? event.target.value : value,
                          ),
                        }));
                        setPilotResult(null);
                      }}
                      className="mt-1 w-full rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm font-normal text-on-surface"
                    />
                  </label>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void reviewPilot()}
              disabled={groundLoading}
              className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >{groundLoading ? money.loading : ground.evaluatePilot}</button>
            {pilotResult && (
              <div className="mt-4 rounded-xl bg-surface-container-low p-3">
                <p className="font-bold">{pilotVerdictText}</p>
                <dl className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt>{ground.daysRecorded}</dt><dd>{pilotResult.days_recorded}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>{ground.averageSales}</dt><dd>{pilotResult.average_units_per_day}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>{ground.forecastRatio}</dt><dd>{Math.round(pilotResult.forecast_ratio * 100)}%</dd>
                  </div>
                  {pilotResult.gross_revenue !== undefined && (
                    <>
                      <div className="flex justify-between gap-3">
                        <dt>{ground.grossRevenue}</dt><dd>{formatRupees(pilotResult.gross_revenue)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>{ground.itemCost}</dt><dd>{formatRupees(pilotResult.item_cost ?? 0)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>{ground.grossProfit}</dt><dd>{formatRupees(pilotResult.gross_profit ?? 0)}</dd>
                      </div>
                    </>
                  )}
                  {pilotResult.other_expenses !== undefined && (
                    <div className="flex justify-between gap-3">
                      <dt>{ground.dailyExpense}</dt><dd>{formatRupees(pilotResult.other_expenses)}</dd>
                    </div>
                  )}
                  {pilotResult.net_profit !== undefined && (
                    <div className="flex justify-between gap-3 font-bold">
                      <dt>{ground.netProfit}</dt><dd>{formatRupees(pilotResult.net_profit)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </section>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{t.sampleNotice}</p>
          <BottomNav />
        </div>
      )}
    </div>
  );
}
