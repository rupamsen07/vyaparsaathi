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
type Screen = "home" | "advisor" | "market" | "time" | "plan";

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
    planMessage: "Your answers are saved on this device. Business costs, break-even and launch steps will appear here as you build your plan.",
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
    planMessage: "आपके जवाब इस डिवाइस पर सेव हैं। लागत, ब्रेक-ईवन और शुरू करने के कदम आपकी योजना बनाते समय यहां दिखेंगे।",
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
    planMessage: "तुमची उत्तरे या डिव्हाइसवर जतन केली आहेत. खर्च, ब्रेक-इव्हन आणि सुरुवातीची पावले योजना तयार होताना येथे दिसतील.",
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
    planMessage: "તમારા જવાબો આ ઉપકરણ પર સાચવ્યા છે. ખર્ચ, બ્રેક-ઈવન અને શરૂઆતનાં પગલાં તમારી યોજના સાથે અહીં દેખાશે.",
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
    planMessage: "আপনার উত্তর এই ডিভাইসে সংরক্ষিত। পরিকল্পনা তৈরি হলে খরচ, ব্রেক-ইভেন এবং শুরুর পদক্ষেপ এখানে দেখা যাবে।",
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
        if (parsed.activeScreen && ["home", "advisor", "market", "time", "plan"].includes(parsed.activeScreen)) {
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

          <section className="mt-4 rounded-2xl border border-outline-variant/50 bg-white p-4">
            <h2 className="font-bold">{t.cityPulse}</h2>
            <p className="mt-2 text-sm text-outline">{t.noNews}</p>
          </section>
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
