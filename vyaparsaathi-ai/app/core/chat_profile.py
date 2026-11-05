import re

from app.models.state import BusinessContext, UserProfile, VyaparState


def next_profile_field(state: VyaparState) -> str | None:
    profile = state.user_profile or UserProfile()
    business = state.business_context or BusinessContext()
    if not (business.mode or "").lower().startswith("discover") and not business.business_name:
        return "business"
    if profile.available_capital is None:
        return "capital"
    if not profile.skills:
        return "skill"
    if not business.candidate_zones:
        return "area"
    if not profile.working_hours:
        return "hours"
    return None


def localized_question(field: str | None, language: str, state: VyaparState) -> str:
    questions = {
        "English": {
            "business": "What business would you like to start or grow?",
            "capital": "How much money can you invest to get started?",
            "skill": "What skills or experience could you use in this business?",
            "area": "Which neighborhood in {city} are you considering?",
            "hours": "What hours can you work: morning, lunch, evening, or all day?",
            "planning": "What would you like to explore first: location, busy hours, costs, or a launch plan?",
        },
        "Hindi": {
            "business": "आप कौन-सा व्यवसाय शुरू करना या बढ़ाना चाहते हैं?",
            "capital": "शुरुआत के लिए आप कितनी पूँजी लगा सकते हैं?",
            "skill": "इस व्यवसाय में आपके पास कौन-सा कौशल या अनुभव है?",
            "area": "आप {city} के किस इलाके में व्यवसाय करना चाहते हैं?",
            "hours": "आप किस समय काम कर सकते हैं—सुबह, दोपहर, शाम या पूरे दिन?",
            "planning": "आप पहले किस बारे में जानना चाहेंगे—जगह, व्यस्त समय, खर्च या शुरू करने की योजना?",
        },
        "Marathi": {
            "business": "तुम्हाला कोणता व्यवसाय सुरू करायचा किंवा वाढवायचा आहे?",
            "capital": "सुरुवातीसाठी तुम्ही किती भांडवल गुंतवू शकता?",
            "skill": "या व्यवसायासाठी तुमच्याकडे कोणते कौशल्य किंवा अनुभव आहे?",
            "area": "{city} मधील कोणत्या भागात तुम्ही व्यवसायाचा विचार करत आहात?",
            "hours": "तुम्ही कोणत्या वेळी काम करू शकता—सकाळी, दुपारी, संध्याकाळी की पूर्ण दिवस?",
            "planning": "तुम्हाला आधी कशाबद्दल जाणून घ्यायचे आहे—ठिकाण, गर्दीची वेळ, खर्च की व्यवसाय सुरू करण्याची योजना?",
        },
        "Gujarati": {
            "business": "તમે કયો વ્યવસાય શરૂ કરવા અથવા આગળ વધારવા માંગો છો?",
            "capital": "શરૂઆત કરવા માટે તમે કેટલી મૂડી રોકી શકો છો?",
            "skill": "આ વ્યવસાય માટે તમારી પાસે કઈ કુશળતા અથવા અનુભવ છે?",
            "area": "તમે {city}ના કયા વિસ્તારમાં વ્યવસાય કરવાનું વિચારી રહ્યા છો?",
            "hours": "તમે કયા સમયે કામ કરી શકો છો—સવારે, બપોરે, સાંજે કે આખો દિવસ?",
            "planning": "તમે પહેલાં શું જાણવા માંગો છો—સ્થળ, વ્યસ્ત સમય, ખર્ચ કે શરૂઆતની યોજના?",
        },
        "Bengali": {
            "business": "আপনি কোন ব্যবসা শুরু করতে বা বাড়াতে চান?",
            "capital": "শুরু করার জন্য আপনি কত টাকা বিনিয়োগ করতে পারবেন?",
            "skill": "এই ব্যবসার জন্য আপনার কী দক্ষতা বা অভিজ্ঞতা আছে?",
            "area": "আপনি {city}-র কোন এলাকায় ব্যবসা করার কথা ভাবছেন?",
            "hours": "আপনি কখন কাজ করতে পারবেন—সকাল, দুপুর, সন্ধ্যা, না সারাদিন?",
            "planning": "আপনি আগে কী জানতে চান—জায়গা, ব্যস্ত সময়, খরচ, না শুরু করার পরিকল্পনা?",
        },
    }
    localized = questions.get(language, questions["English"])
    question_key = field or "planning"
    city = (state.user_profile.city if state.user_profile else None) or "your city"
    return localized.get(question_key, localized["planning"]).format(city=city)


def rule_based_extraction(state: VyaparState, user_message: str) -> VyaparState:
    values = state.model_dump()
    profile = values.get("user_profile") or {}
    business = values.get("business_context") or {}
    values["user_profile"] = profile
    values["business_context"] = business
    message = user_message.lower()

    for city, keywords in (
        ("Bengaluru", ("bengaluru", "bangalore")),
        ("Pune", ("pune",)),
    ):
        if any(keyword in message for keyword in keywords):
            profile["city"] = city

    for area, keywords in (
        ("BTM Layout", ("btm", "btm layout")),
        ("Koramangala", ("koramangala",)),
        ("Ejipura", ("ejipura",)),
        ("Domlur", ("domlur",)),
        ("Jakkasandra", ("jakkasandra",)),
        ("Nagar Road", ("nagar road",)),
        ("Yerawada", ("yerawada",)),
        ("Dhole Patil Road", ("dhole patil",)),
    ):
        if any(keyword in message for keyword in keywords):
            business["candidate_zones"] = list(dict.fromkeys(
                [*(business.get("candidate_zones") or []), area]
            ))
            profile["city"] = "Pune" if area in {"Nagar Road", "Yerawada", "Dhole Patil Road"} else "Bengaluru"

    for name, keywords in (
        ("Momo cart", ("momo", "momos")),
        ("Chai and snacks cart", ("chai", "tea cart")),
        ("Vada pav cart", ("vada pav", "vadapav")),
        ("Fresh juice cart", ("juice cart", "fresh juice")),
        ("Home tiffin service", ("tiffin", "dabba")),
        ("Tailoring unit", ("tailoring", "tailor", "silai")),
        ("Phone repair shop", ("phone repair", "mobile repair")),
        ("Home pickles and papad", ("pickles", "papad")),
    ):
        if any(keyword in message for keyword in keywords):
            business["business_name"] = name
            break

    for skill, keywords in (
        ("cooking", ("cook", "cooking", "khana")),
        ("tailoring", ("tailoring", "tailor", "silai", "stitch")),
        ("phone repair", ("repair", "mobile repair")),
        ("food preparation", ("food preparation", "tiffin")),
    ):
        if any(keyword in message for keyword in keywords):
            profile["skills"] = list(dict.fromkeys([*profile.get("skills", []), skill]))

    for period, keywords in (
        ("morning", ("morning", "subah")),
        ("lunch", ("lunch", "afternoon", "dopahar")),
        ("evening", ("evening", "shaam", "night")),
        ("full_day", ("full day", "all day", "poora din")),
    ):
        if any(keyword in message for keyword in keywords):
            profile["working_hours"] = period
            break

    amount_match = re.search(
        r"(?:₹|rs\.?\s*)?(\d[\d,]*(?:\.\d+)?)\s*(lakh|lac|lakhs|lacs|thousand|hazaar|hazar|k)?",
        message,
    )
    amount = None
    amount_context = any(token in message for token in (
        "₹", "rs", "rupee", "paisa", "budget", "capital", "money", "lakh",
        "lac", "thousand", "hazaar", "hazar", "k",
    ))
    if amount_match and (amount_context or (
        profile.get("available_capital") is None and next_profile_field(state) == "capital"
    )):
        amount = float(amount_match.group(1).replace(",", ""))
        suffix = amount_match.group(2)
        if suffix in {"lakh", "lac", "lakhs", "lacs"}:
            amount *= 100000
        elif suffix in {"thousand", "hazaar", "hazar", "k"}:
            amount *= 1000
    else:
        word_amounts = (
            (r"\b(?:tees|thirty)\s+hazaar\b|तीस हजार|ત્રીસ હજાર|ত্রিশ হাজার", 30000),
            (r"\b(?:pachis|twenty[- ]five)\s+hazaar\b|पच्चीस हजार|पંચવીस हजार|પચ્ચીસ હજાર|পঁচিশ হাজার", 25000),
            (r"\b(?:ek|one)\s+lakh\b|एक लाख|એક લાખ|এক লক্ষ", 100000),
            (r"\b(?:dedh|one and a half)\s+lakh\b|डेढ़ लाख|दीड लाख|દોઢ લાખ|দেড় লক্ষ", 150000),
        )
        for pattern, amount_value in word_amounts:
            if re.search(pattern, message):
                amount = float(amount_value)
                break
    if amount is not None:
        profile["available_capital"] = amount

    if any(token in message for token in ("loan", "borrow", "karz", "ऋण", "લોન", "ঋণ")):
        if re.search(r"\b(no|nahi|nahin)\b|नहीं|नाही|નહીં|না", message):
            profile["loan_needed"] = False
        elif re.search(r"\b(yes|haan|ha)\b|हाँ|होय|હા|হ্যাঁ", message):
            profile["loan_needed"] = True

    return VyaparState(**values)
