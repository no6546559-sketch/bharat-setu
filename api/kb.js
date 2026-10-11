/* AUTO-GENERATED from public/static/schemes.js — do not edit by hand.
   Regenerate with: node scripts/generate-kb.mjs   (keeps the serverless
   grounding context byte-identical to the client knowledge base). */
export const KB = [
 {
  "id": "pm-kisan",
  "name": "PM Kisan Samman Nidhi",
  "name_hi": "पीएम किसान सम्मान निधि",
  "tag": "Farmer income support",
  "cats": [
   "farmer",
   "cash"
  ],
  "benefit": "₹6,000 / year in 3 instalments directly to your bank account",
  "docs": [
   "Aadhaar",
   "Land record (khatauni / 7-12 extract)",
   "Bank passbook",
   "Mobile number linked to Aadhaar"
  ],
  "how": [
   "Visit your nearest CSC (Common Service Centre) or the PM-Kisan portal",
   "Complete e-KYC with Aadhaar & OTP",
   "Upload land record details",
   "Track instalments on the portal by Aadhaar number"
  ],
  "apply_url": "https://pmkisan.gov.in",
  "desc": "Direct income support for all landholding farmer families to buy seeds, fertiliser and meet input costs.",
  "rules": {
   "farmer": true,
   "land_acres": [
    0.01,
    100
   ],
   "age": [
    18,
    120
   ],
   "max_income": 600000
  }
 },
 {
  "id": "kisan-maandhan",
  "name": "PM Kisan Maandhan Yojana",
  "name_hi": "पीएम किसान मानधन योजना",
  "tag": "Farmer pension",
  "cats": [
   "farmer",
   "pension"
  ],
  "benefit": "₹3,000 monthly pension after age 60",
  "docs": [
   "Aadhaar",
   "Bank passbook",
   "Land record",
   "Age proof"
  ],
  "how": [
   "Enrol at your nearest CSC",
   "Choose a monthly contribution between ₹55 and ₹200",
   "Contribute till age 60",
   "Receive pension from the LIC-administered fund"
  ],
  "apply_url": "https://maandhan.in",
  "desc": "Voluntary contributory pension for small & marginal farmers (land up to 2 hectares).",
  "rules": {
   "farmer": true,
   "land_acres": [
    0.01,
    5
   ],
   "age": [
    18,
    40
   ]
  }
 },
 {
  "id": "pm-shram-yogi",
  "name": "PM Shram Yogi Maan-Dhan",
  "name_hi": "पीएम श्रम योगी मानधन",
  "tag": "Unorganised worker pension",
  "cats": [
   "worker",
   "pension"
  ],
  "benefit": "₹3,000 monthly pension after age 60",
  "docs": [
   "Aadhaar",
   "Savings bank account",
   "Mobile number"
  ],
  "how": [
   "Find enrolment centre on maandhan.in",
   "Contribute ₹55–₹200 monthly",
   "Co-contribution from Government is equal",
   "Pension starts at 60"
  ],
  "apply_url": "https://maandhan.in",
  "desc": "Old-age protection for unorganised workers such as street vendors, drivers, guards, helpers.",
  "rules": {
   "worker": true,
   "age": [
    18,
    40
   ],
   "max_income": 200000
  }
 },
 {
  "id": "ration-ppb",
  "name": "Ration Card (NFSA / On-e-KYC)",
  "name_hi": "राशन कार्ड (राष्ट्रीय खाद्य सुरक्षा)",
  "tag": "Food security",
  "cats": [
   "bpl",
   "food",
   "family"
  ],
  "benefit": "5 kg free grain per person per month (rice/wheat) + pulses",
  "docs": [
   "Aadhaar of all members",
   "Residence proof",
   "Income certificate",
   "Ration card application form"
  ],
  "how": [
   "Apply at the district Food & Civil Supplies office or online state portal",
   "e-KYC at the fair price shop",
   "Card issued within 30 days",
   "Collect monthly grain with Aadhaar authentication"
  ],
  "apply_url": "https://dfpd.gov.in",
  "desc": "Priority Household / Antyodaya ration entitlement delivered through the Public Distribution System.",
  "rules": {
   "bpl": true,
   "income_max": 250000,
   "family": true
  }
 },
 {
  "id": "pm-ujjwala",
  "name": "PM Ujjwala Yojana 2.0",
  "name_hi": "पीएम उज्ज्वला योजना 2.0",
  "tag": "Clean cooking fuel",
  "cats": [
   "bpl",
   "women",
   "energy"
  ],
  "benefit": "Free LPG connection + first refill & stove free",
  "docs": [
   "Aadhaar",
   "Ration card / BPL proof",
   "Bank passbook",
   "Address proof"
  ],
  "how": [
   "Apply at any LPG distributor or on pmuy.gov.in",
   "Choose an oil company (Indane/Bharat/HP)",
   "KYC verification",
   "Get connection in about a week"
  ],
  "apply_url": "https://www.pmuy.gov.in",
  "desc": "Deposit-free LPG connection for women from poor households to replace smoky chulhas.",
  "rules": {
   "bpl": true,
   "women": true,
   "family": true,
   "income_max": 300000
  }
 },
 {
  "id": "jal-jeevan",
  "name": "Jal Jeevan Mission — Tap Water",
  "name_hi": "जल जीवन मिशन — नल जल",
  "tag": "Safe drinking water",
  "cats": [
   "rural",
   "water",
   "family"
  ],
  "benefit": "Functional household tap connection with 55 litres/day per person",
  "docs": [
   "Ration card / village residence proof",
   "Aadhaar",
   "Gram Panchayat request"
  ],
  "how": [
   "Ask your Gram Panchayat / PHE department for a new connection",
   "Verify the village IMIS status on the portal",
   "Report a non-functional tap on the portal",
   "Track works at village level"
  ],
  "apply_url": "https://jaljeevanmission.gov.in",
  "desc": "Piped drinking water to every rural household; village-level reporting and grievance redress.",
  "rules": {
   "rural": true,
   "family": true
  }
 },
 {
  "id": "pmay-g",
  "name": "PM Awas Yojana — Gramin",
  "name_hi": "पीएम आवास योजना — ग्रामीण",
  "tag": "Rural housing",
  "cats": [
   "rural",
   "housing"
  ],
  "benefit": "Up to ₹1.30 lakh assistance to build a pucca house + MGNREGA labour wages",
  "docs": [
   "Aadhaar",
   "Job card / SECC listing",
   "Bank passbook",
   "Land documents"
  ],
  "how": [
   "Check your name in the SECC/awaas+ beneficiary list",
   "Apply through Gram Panchayat",
   "Geo-tagging of construction stages",
   "Instalments released in 3–4 tranches"
  ],
  "apply_url": "https://pmayg.nic.in",
  "desc": "Assistance for homeless families and those living in kutcha/dilapidated houses in rural areas.",
  "rules": {
   "rural": true,
   "housing": "kutcha",
   "income_max": 600000
  }
 },
 {
  "id": "pmay-u",
  "name": "PM Awas Yojana — Urban / PMAY-U 2.0",
  "name_hi": "पीएम आवास योजना — शहरी",
  "tag": "Urban housing",
  "cats": [
   "urban",
   "housing"
  ],
  "benefit": "Interest subsidy up to ₹1.80 lakh on home loan (up to ₹6.5 lakh subsidy for affordable homes)",
  "docs": [
   "Aadhaar",
   "Income certificate",
   "Bank account / loan sanction letter",
   "Self-declaration of no pucca house"
  ],
  "how": [
   "Apply on pmay-urban.gov.in or via your ULB",
   "Check eligibility for the CLSS interest subsidy",
   "Bank submits the subsidy claim",
   "Subsidy credited to your loan account"
  ],
  "apply_url": "https://pmay-urban.gov.in",
  "desc": "Affordable housing for the urban poor — beneficiary-led construction, affordable rental housing and interest subsidy.",
  "rules": {
   "urban": true,
   "housing": "kutcha",
   "income_max": 900000
  }
 },
 {
  "id": "saubhagya",
  "name": "Saubhagya — Free Electricity Connection",
  "name_hi": "सौभाग्य — मुफ्त बिजली कनेक्शन",
  "tag": "Household electrification",
  "cats": [
   "rural",
   "energy",
   "family"
  ],
  "benefit": "Free electricity connection (worth ~₹3,000) + wiring & meter free for BPL families",
  "docs": [
   "Aadhaar",
   "BPL card",
   "Address proof"
  ],
  "how": [
   "Contact the local DISCOM camp or panchayat",
   "Physical verification of BPL status",
   "Meter installed free for BPL",
   "Grievance: 1912 helpline"
  ],
  "apply_url": "https://powermin.gov.in",
  "desc": "Last-mile electrification of un-electrified households under the Saubhagya / RDSS programmes.",
  "rules": {
   "bpl": true,
   "rural": true,
   "family": true
  }
 },
 {
  "id": "ayushman",
  "name": "Ayushman Bharat (PM-JAY)",
  "name_hi": "आयुष्मान भारत (पीएम-जय)",
  "tag": "Hospital insurance",
  "cats": [
   "bpl",
   "health",
   "family"
  ],
  "benefit": "₹5 lakh per family per year cashless hospitalisation + ₹5 lakh for all citizens aged 70+",
  "docs": [
   "Aadhaar",
   "Ration card / SECC listing",
   "Ayushman card (e-KYC)"
  ],
  "how": [
   "Check your name at beneficiary.nha.gov.in or the Ayushman app",
   "Complete e-KYC at a CSC / hospital",
   "Download the Ayushman card",
   "Show it at any empanelled hospital for cashless care"
  ],
  "apply_url": "https://beneficiary.nha.gov.in",
  "desc": "World's largest health assurance scheme covering secondary & tertiary hospital care at empanelled hospitals.",
  "rules": {
   "bpl": true,
   "health": true,
   "age_min_any": 70,
   "income_max": 400000
  }
 },
 {
  "id": "jan-aushadhi",
  "name": "PM Jan Aushadhi — Generic Medicines",
  "name_hi": "पीएम जन औषधि — जेनेरिक दवाएं",
  "tag": "Affordable medicines",
  "cats": [
   "health",
   "all"
  ],
  "benefit": "Quality generic medicines at 50–90% lower price + ₹5 Suvidha sanitary pads",
  "docs": [
   "Doctor's prescription (no documents needed for purchase)"
  ],
  "how": [
   "Find the nearest Janaushadhi Kendra on the portal",
   "Show your prescription",
   "Buy generics at 50–90% less",
   "Ask for the Janaushadhi Sugam app to compare prices"
  ],
  "apply_url": "https://janaushadhi.gov.in",
  "desc": "Generic medicine outlets across the country so treatment does not push families into debt.",
  "rules": {
   "any": true
  }
 },
 {
  "id": "jsy",
  "name": "Janani Suraksha Yojana",
  "name_hi": "जननी सुरक्षा योजना",
  "tag": "Maternal health",
  "cats": [
   "women",
   "health",
   "bpl"
  ],
  "benefit": "₹1,400 cash (rural) / ₹1,000 (urban) for institutional delivery + free delivery care",
  "docs": [
   "Aadhaar",
   "MCP card",
   "BPL / SC-ST / JSY card",
   "Bank passbook"
  ],
  "how": [
   "Register at the nearest ASHA / ANM / PHC",
   "Get at least 3 antenatal check-ups",
   "Deliver at a government facility",
   "Cash is transferred to your bank account"
  ],
  "apply_url": "https://nhm.gov.in",
  "desc": "Safe motherhood intervention promoting institutional delivery among poor pregnant women.",
  "rules": {
   "women": true,
   "bpl": true,
   "age": [
    19,
    49
   ]
  }
 },
 {
  "id": "pmsma",
  "name": "Pradhan Mantri Surakshit Matritva Abhiyan",
  "name_hi": "प्रधानमंत्री सुरक्षित मातृत्व अभियान",
  "tag": "Free pregnancy check-up",
  "cats": [
   "women",
   "health"
  ],
  "benefit": "Free comprehensive antenatal check-up on the 9th of every month",
  "docs": [
   "MCP card",
   "Aadhaar (optional)"
  ],
  "how": [
   "Visit a government PHC/CHC on the 9th",
   "Carry your MCP card",
   "Get tests, ultrasound referral & medicines free",
   "High-risk cases are tracked by name"
  ],
  "apply_url": "https://pmsma.mohfw.gov.in",
  "desc": "Assured free antenatal care by specialists for every pregnant woman on the 9th of each month.",
  "rules": {
   "women": true,
   "pregnant": true
  }
 },
 {
  "id": "nikshay",
  "name": "Ni-kshay Poshan Yojana (TB Support)",
  "name_hi": "निक्षय पोषण योजना (टीबी सहायता)",
  "tag": "TB nutrition support",
  "cats": [
   "health",
   "all"
  ],
  "benefit": "₹1,000 per month nutritional support for the full TB treatment period",
  "docs": [
   "Aadhaar",
   "Bank passbook",
   "TB notification at the health facility"
  ],
  "how": [
   "Get notified as a TB patient at any government facility",
   "Register on the Ni-kshay portal",
   "Bank account is linked",
   "Monthly DBT is credited till completion"
  ],
  "apply_url": "https://nikshay.in",
  "desc": "Direct benefit transfer for every notified TB patient to improve nutrition and treatment outcomes.",
  "rules": {
   "any": true,
   "tb": true
  }
 },
 {
  "id": "ssy",
  "name": "Sukanya Samriddhi Yojana",
  "name_hi": "सुकन्या समृद्धि योजना",
  "tag": "Girl child savings",
  "cats": [
   "women",
   "girls",
   "savings"
  ],
  "benefit": "Highest small-savings interest (~8.2%) + full tax benefit (80C) on deposits",
  "docs": [
   "Birth certificate of girl",
   "Aadhaar of guardian",
   "Address proof",
   "Photograph"
  ],
  "how": [
   "Open at any post office or authorised bank",
   "Minimum ₹250, maximum ₹1.5 lakh per year",
   "Deposit for 15 years, matures in 21 years",
   "Partial withdrawal allowed for higher education after 18"
  ],
  "apply_url": "https://www.indiapost.gov.in",
  "desc": "Small deposit scheme for a girl child below 10 years, maturity after 21 years or on marriage after 18.",
  "rules": {
   "girl_child": true,
   "child_age": [
    0,
    10
   ]
  }
 },
 {
  "id": "bbbp",
  "name": "Beti Bachao Beti Padhao",
  "name_hi": "बेटी बचाओ बेटी पढ़ाओ",
  "tag": "Girl child empowerment",
  "cats": [
   "women",
   "girls",
   "education"
  ],
  "benefit": "Survival, protection & education support for the girl child (state-level cash incentives)",
  "docs": [
   "Birth certificate",
   "Aadhaar",
   "Bank account in the girl's name",
   "School/college certificate"
  ],
  "how": [
   "Ask your school/anganwadi about the state girls' incentive scheme",
   "Submit bank details & certificates",
   "Incentive credited at each educational milestone",
   "Helpline 181 for support"
  ],
  "apply_url": "https://wcd.gov.in",
  "desc": "National campaign plus state incentive schemes that reward girl-child education milestones.",
  "rules": {
   "girl_child": true
  }
 },
 {
  "id": "kanya-sum",
  "name": "Kanya Sumangala / State Girl-Child Scheme",
  "name_hi": "कन्या सुमंगला योजना",
  "tag": "Girl child cash support",
  "cats": [
   "women",
   "girls",
   "cash"
  ],
  "benefit": "Up to ₹25,000 in 6 stages from birth to graduation (varies by state)",
  "docs": [
   "Aadhaar of parents & child",
   "Birth certificate",
   "Income certificate",
   "Bank account in child's name"
  ],
  "how": [
   "Apply on your state's girl-child scheme portal",
   "Complete verification at the block office",
   "Amount released at each stage",
   "Renewal needs school certificate each stage"
  ],
  "apply_url": "https://wcd.gov.in",
  "desc": "State-level multi-stage cash transfer for the girl child of poor families — a model now copied by several states.",
  "rules": {
   "girl_child": true,
   "income_max": 300000,
   "bpl": true
  }
 },
 {
  "id": "maternity-benefit",
  "name": "PMMVY — Maternity Benefit",
  "name_hi": "प्रधानमंत्री मातृ वंदना योजना",
  "tag": "Maternity cash benefit",
  "cats": [
   "women",
   "health",
   "cash"
  ],
  "benefit": "₹5,000 cash for the first living child (₹6,000 for the second if a girl)",
  "docs": [
   "Aadhaar",
   "MCP card",
   "Bank passbook",
   "Age proof (19+)"
  ],
  "how": [
   "Apply at the nearest Anganwadi / ASHA centre",
   "Submit MCP card & bank details",
   "Verification by the CDPO",
   "Amount transferred in one or two instalments"
  ],
  "apply_url": "https://pmmvy.wcd.gov.in",
  "desc": "Wage compensation for pregnant/lactating mothers to meet nutrition and delivery needs.",
  "rules": {
   "women": true,
   "age": [
    19,
    49
   ],
   "pregnant": true,
   "income_max": 300000
  }
 },
 {
  "id": "widow-pension",
  "name": "Indira Gandhi National Widow Pension",
  "name_hi": "इंदिरा गांधी राष्ट्रीय विधवा पेंशन",
  "tag": "Widow pension",
  "cats": [
   "women",
   "pension",
   "bpl"
  ],
  "benefit": "₹300 (central share) + topped up by states — often ₹1,000–₹2,000 monthly",
  "docs": [
   "Aadhaar",
   "Death certificate of spouse",
   "BPL card",
   "Bank passbook"
  ],
  "how": [
   "Apply at the Block / Tehsil Social Welfare office or the state NSAP portal",
   "Attach spouse's death certificate",
   "Bank account seeding with Aadhaar",
   "Pension credited monthly"
  ],
  "apply_url": "https://nsap.nic.in",
  "desc": "Monthly pension for widows from BPL households, aged 18–79 (NSAP).",
  "rules": {
   "women": true,
   "widow": true,
   "bpl": true,
   "age": [
    18,
    79
   ]
  }
 },
 {
  "id": "adip",
  "name": "ADIP — Aids & Assistive Devices",
  "name_hi": "एडीआईपी — सहायक उपकरण योजना",
  "tag": "Assistive devices",
  "cats": [
   "disability",
   "health"
  ],
  "benefit": "Free or subsidised wheelchairs, hearing aids, prosthetics, smart canes",
  "docs": [
   "Disability certificate (UDID)",
   "Aadhaar",
   "Income certificate"
  ],
  "how": [
   "Register on the ADIP/SAMARTH portal",
   "Attend the assessment camp",
   "Choose the prescribed device",
   "Device delivered free or at 10% cost above the income threshold"
  ],
  "apply_url": "https://www.adip.gov.in",
  "desc": "Assistance for purchasing aids and appliances for persons with disabilities as per the ADIP scheme norms.",
  "rules": {
   "disability": true,
   "income_max": 400000
  }
 },
 {
  "id": "disability-pension",
  "name": "Indira Gandhi National Disability Pension",
  "name_hi": "इंदिरा गांधी राष्ट्रीय दिव्यांग पेंशन",
  "tag": "Disability pension",
  "cats": [
   "disability",
   "pension",
   "bpl"
  ],
  "benefit": "₹300 central + state top-up monthly for 80%+ disability",
  "docs": [
   "UDID / disability certificate",
   "Aadhaar",
   "BPL card",
   "Bank passbook"
  ],
  "how": [
   "Apply at the Block Social Welfare office or state NSAP portal",
   "Attach UDID certificate",
   "Verification within 30 days",
   "Monthly pension to bank account"
  ],
  "apply_url": "https://nsap.nic.in",
  "desc": "Monthly pension for severely disabled persons from BPL households aged 18–79 (NSAP).",
  "rules": {
   "disability": true,
   "bpl": true,
   "age": [
    18,
    79
   ]
  }
 },
 {
  "id": "old-age-pension",
  "name": "Indira Gandhi National Old Age Pension",
  "name_hi": "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन",
  "tag": "Old-age pension",
  "cats": [
   "senior",
   "pension",
   "bpl"
  ],
  "benefit": "₹200 (60–79 yrs) / ₹500 (80+) central + state top-up, monthly",
  "docs": [
   "Aadhaar",
   "Age proof",
   "BPL card",
   "Bank passbook"
  ],
  "how": [
   "Apply at the Block/Tehsil office or state NSAP portal",
   "Age & BPL verification",
   "Aadhaar seeding of bank account",
   "Monthly DBT credit"
  ],
  "apply_url": "https://nsap.nic.in",
  "desc": "Monthly pension for BPL persons aged 60 and above under the National Social Assistance Programme.",
  "rules": {
   "senior": true,
   "bpl": true,
   "age": [
    60,
    120
   ]
  }
 },
 {
  "id": "vayoshri",
  "name": "Rashtriya Vayoshri Yojana",
  "name_hi": "राष्ट्रीय वयोश्री योजना",
  "tag": "Elderly assistive devices",
  "cats": [
   "senior",
   "disability",
   "health"
  ],
  "benefit": "Free walking sticks, walkers, hearing aids, dentures, spectacles",
  "docs": [
   "Aadhaar (60+)",
   "BPL card",
   "Medical assessment"
  ],
  "how": [
   "Watch for the ALIMCO assessment camp in your district",
   "Attend with Aadhaar & BPL card",
   "Devices assessed & distributed free",
   "Track camps on the ALIMCO site"
  ],
  "apply_url": "https://www.alimco.in",
  "desc": "Assistive living devices distributed free to senior citizens with age-related disabilities from BPL households.",
  "rules": {
   "senior": true,
   "bpl": true,
   "age": [
    60,
    120
   ]
  }
 },
 {
  "id": "nsp",
  "name": "National Scholarship Portal — Scholarships",
  "name_hi": "राष्ट्रीय छात्रवृत्ति पोर्टल",
  "tag": "Scholarships",
  "cats": [
   "student",
   "education",
   "cash"
  ],
  "benefit": "Pre-matric, post-matric & merit scholarships — ₹5,000 to ₹2 lakh per year",
  "docs": [
   "Aadhaar",
   "Income certificate",
   "Caste certificate (if applicable)",
   "Marksheet / bonafide certificate",
   "Bank passbook"
  ],
  "how": [
   "Register on scholarships.gov.in with Aadhaar",
   "Choose all scholarships you qualify for",
   "Upload documents, submit before the deadline",
   "Track status & renew each year"
  ],
  "apply_url": "https://scholarships.gov.in",
  "desc": "Single-window portal for 80+ central & state scholarships for SC/ST/OBC/minority/girl/PwD students.",
  "rules": {
   "student": true,
   "income_max": 800000
  }
 },
 {
  "id": "pm-vidyalaxmi",
  "name": "PM Vidyalaxmi — Education Loan",
  "name_hi": "पीएम विद्यालक्ष्मी — शिक्षा ऋण",
  "tag": "Education loan",
  "cats": [
   "student",
   "education",
   "loan"
  ],
  "benefit": "Collateral-free education loan up to ₹10 lakh with 3% interest subvention",
  "docs": [
   "Aadhaar",
   "Admission letter of institution",
   "Fee structure",
   "Class 12 marksheet",
   "Income proof"
  ],
  "how": [
   "Register on the Vidya Lakshmi portal",
   "Fill one common form for multiple banks",
   "Compare offers, accept one",
   "Interest subvention applies for family income under ₹8 lakh"
  ],
  "apply_url": "https://www.vidyalakshmi.co.in",
  "desc": "Single-window portal for collateral-free, guarantor-free education loans to meritorious students.",
  "rules": {
   "student": true,
   "income_max": 800000
  }
 },
 {
  "id": "skill-india",
  "name": "Skill India / PMKVY",
  "name_hi": "स्किल इंडिया / पीएमकेवीवाई",
  "tag": "Free skill training",
  "cats": [
   "student",
   "worker",
   "skill",
   "employment"
  ],
  "benefit": "Free short-term training + assessment fee paid + placement assistance",
  "docs": [
   "Aadhaar",
   "Education certificate",
   "Bank account",
   "Photograph"
  ],
  "how": [
   "Search courses on skillindia.gov.in / PMKVY portal",
   "Enrol at the nearest training centre",
   "Attend free training of 150–300 hours",
   "Pass the assessment for certification & placement support"
  ],
  "apply_url": "https://www.skillindia.gov.in",
  "desc": "Short-term skill certification in 300+ trades for school/college dropouts and job seekers.",
  "rules": {
   "age": [
    15,
    45
   ],
   "student_or_worker": true
  }
 },
 {
  "id": "naps",
  "name": "National Apprenticeship Promotion Scheme",
  "name_hi": "राष्ट्रीय प्रशिक्षुता प्रोत्साहन योजना",
  "tag": "Paid apprenticeship",
  "cats": [
   "student",
   "worker",
   "employment",
   "skill"
  ],
  "benefit": "Stipend up to ₹9,000/month; Govt pays 25% (up to ₹1,500) of the stipend",
  "docs": [
   "Aadhaar",
   "Educational certificates",
   "Bank account"
  ],
  "how": [
   "Register as a candidate on apprenticeshipindia.gov.in",
   "Apply to establishments hiring apprentices",
   "Sign the apprenticeship contract",
   "Get a stipend while you learn"
  ],
  "apply_url": "https://www.apprenticeshipindia.gov.in",
  "desc": "Apprenticeship training in industry with a stipend, leading to a recognized qualification and often a job.",
  "rules": {
   "age": [
    14,
    40
   ],
   "student_or_worker": true
  }
 },
 {
  "id": "ddu-gky",
  "name": "DDU-GKY — Rural Youth Placement",
  "name_hi": "डीडीयू-जीकेवाई — ग्रामीण युवा रोजगार",
  "tag": "Placement-linked training",
  "cats": [
   "rural",
   "student",
   "employment",
   "skill"
  ],
  "benefit": "Free residential training + guaranteed placement + travel support",
  "docs": [
   "Aadhaar",
   "Age proof",
   "Rural residence / MGNREGA job card",
   "Education certificate"
  ],
  "how": [
   "Contact the DDU-GKY project officer at your district",
   "Enrol in a residential course",
   "Complete training with stipend",
   "Get placed with post-placement support"
  ],
  "apply_url": "https://ddugky.gov.in",
  "desc": "Placement-linked skill development for rural poor youth aged 15–35 under the Ministry of Rural Development.",
  "rules": {
   "age": [
    15,
    35
   ],
   "rural": true,
   "income_max": 400000
  }
 },
 {
  "id": "mgnrega",
  "name": "MGNREGA — Guaranteed Rural Work",
  "name_hi": "मनरेगा — ग्रामीण रोजगार गारंटी",
  "tag": "140 days guaranteed work",
  "cats": [
   "rural",
   "employment",
   "worker"
  ],
  "benefit": "100–150 days of unskilled work per household per year, paid weekly at the notified wage",
  "docs": [
   "Aadhaar",
   "Ration card",
   "Rural residence proof",
   "Bank/post office passbook",
   "Photograph"
  ],
  "how": [
   "Apply for a Job Card at the Gram Panchayat (free, 15-day deadline)",
   "Submit a written work demand",
   "Get a dated receipt — that is your proof",
   "Wages to your bank account within 15 days"
  ],
  "apply_url": "https://nrega.nic.in",
  "desc": "Legally guaranteed rural employment — demand work, get a receipt, and if not given within 15 days an unemployment allowance is due.",
  "rules": {
   "rural": true,
   "age": [
    18,
    120
   ]
  }
 },
 {
  "id": "mudra",
  "name": "PM MUDRA Yojana",
  "name_hi": "पीएम मुद्रा योजना",
  "tag": "Collateral-free business loan",
  "cats": [
   "worker",
   "business",
   "loan"
  ],
  "benefit": "Loans up to ₹20 lakh (Tarun Plus) with no collateral, for income-generating activity",
  "docs": [
   "Aadhaar",
   "PAN",
   "Business plan / quotation",
   "Bank statement",
   "Address proof"
  ],
  "how": [
   "Approach any bank / NBFC / MFI with the Jan Samarth portal",
   "Submit your business plan",
   "Choose the Shishu/Kishore/Tarun slab",
   "Loan sanctioned without collateral"
  ],
  "apply_url": "https://www.jansamarth.in",
  "desc": "Micro-loans under Shishu (₹50k), Kishore (₹5L), Tarun (₹10L) and Tarun Plus (₹20L) for non-farm enterprises.",
  "rules": {
   "business": true,
   "age": [
    18,
    70
   ]
  }
 },
 {
  "id": "pm-svanidhi",
  "name": "PM SVANidhi — Street Vendor Loan",
  "name_hi": "पीएम स्वनिधि — रेहड़ी-पटरी ऋण",
  "tag": "Street vendor micro-loan",
  "cats": [
   "urban",
   "worker",
   "business",
   "loan"
  ],
  "benefit": "Working capital ₹10,000 → ₹20,000 → ₹50,000 across cycles + 7% interest subsidy",
  "docs": [
   "Aadhaar",
   "Certificate of Vending / ULB recommendation",
   "Bank passbook",
   "Photograph"
  ],
  "how": [
   "Apply on pmsvanidhi.mohua.gov.in",
   "Get the Certificate of Vending from your ULB",
   "Bank sanctions the loan",
   "Repay on time to unlock the next, larger cycle"
  ],
  "apply_url": "https://pmsvanidhi.mohua.gov.in",
  "desc": "Collateral-free working capital loans for street vendors with a certificate of vending or a letter of recommendation.",
  "rules": {
   "urban": true,
   "worker": true,
   "age": [
    18,
    70
   ]
  }
 },
 {
  "id": "standup-india",
  "name": "Stand-Up India",
  "name_hi": "स्टैंड-अप इंडिया",
  "tag": "First-time entrepreneur loan",
  "cats": [
   "business",
   "loan",
   "women",
   "scst"
  ],
  "benefit": "₹10 lakh to ₹1 crore composite loan at a concessional rate for greenfield enterprises",
  "docs": [
   "Aadhaar",
   "PAN",
   "Caste certificate (SC/ST)",
   "Business plan & quotations",
   "Bank statement"
  ],
  "how": [
   "Apply on the Stand-Up India portal or at any bank branch",
   "Submit project report & machinery quotations",
   "Bank appraises and sanctions",
   "Repay in 7 years with up to 18 months moratorium"
  ],
  "apply_url": "https://www.standupmitra.in",
  "desc": "Bank loans for SC/ST and women entrepreneurs setting up a manufacturing, service or trading enterprise.",
  "rules": {
   "business": true,
   "sc_st_or_woman": true,
   "age": [
    18,
    70
   ]
  }
 },
 {
  "id": "pmegp",
  "name": "PMEGP — Prime Minister's Employment Generation Programme",
  "name_hi": "पीएमईजीपी — रोजगार सृजन कार्यक्रम",
  "tag": "Subsidised micro-enterprise",
  "cats": [
   "business",
   "loan",
   "employment"
  ],
  "benefit": "Up to 35% margin money subsidy on project cost up to ₹50 lakh (manufacturing)",
  "docs": [
   "Aadhaar",
   "Education certificate (8th pass for projects above ₹10 lakh)",
   "Project report",
   "Caste/special category certificate"
  ],
  "how": [
   "Apply online on the KVIC PMEGP e-portal",
   "Attend the district task force interview",
   "Bank sanctions the balance loan",
   "Subsidy is adjusted in the loan account"
  ],
  "apply_url": "https://www.kviconline.gov.in/pmegpeportal",
  "desc": "Credit-linked subsidy for setting up manufacturing or service micro-enterprises generating self-employment.",
  "rules": {
   "business": true,
   "age": [
    18,
    70
   ]
  }
 },
 {
  "id": "pmjjby",
  "name": "PM Jeevan Jyoti Bima Yojana",
  "name_hi": "पीएम जीवन ज्योति बीमा योजना",
  "tag": "₹2 lakh life cover",
  "cats": [
   "insurance",
   "worker",
   "all"
  ],
  "benefit": "₹2 lakh life insurance for just ₹436 per year",
  "docs": [
   "Aadhaar",
   "Bank account",
   "Auto-debit consent form"
  ],
  "how": [
   "Submit the consent form at your bank / post office or via net banking",
   "Premium auto-debited each year",
   "Cover continues as long as premium is paid (till 55)",
   "Claim by the nominee"
  ],
  "apply_url": "https://jansuraksha.gov.in",
  "desc": "Renewable one-year life insurance for bank account holders aged 18–50.",
  "rules": {
   "age": [
    18,
    50
   ],
   "any": true
  }
 },
 {
  "id": "pmsby",
  "name": "PM Suraksha Bima Yojana",
  "name_hi": "पीएम सुरक्षा बीमा योजना",
  "tag": "₹2 lakh accident cover",
  "cats": [
   "insurance",
   "all"
  ],
  "benefit": "₹2 lakh accidental death & disability cover for ₹20 per year",
  "docs": [
   "Aadhaar",
   "Bank account",
   "Consent-cum-auto-debit form"
  ],
  "how": [
   "Sign the form at your bank or through net banking",
   "₹20 auto-debited annually",
   "Cover is 1 June – 31 May each year",
   "File the claim with the police/medical record"
  ],
  "apply_url": "https://jansuraksha.gov.in",
  "desc": "Accident insurance giving ₹2 lakh for accidental death/total disability and ₹1 lakh for partial disability.",
  "rules": {
   "age": [
    18,
    70
   ],
   "any": true
  }
 },
 {
  "id": "atal-pension",
  "name": "Atal Pension Yojana",
  "name_hi": "अटल पेंशन योजना",
  "tag": "Guaranteed pension",
  "cats": [
   "pension",
   "worker",
   "all"
  ],
  "benefit": "Assured pension of ₹1,000–₹5,000 per month after 60",
  "docs": [
   "Aadhaar",
   "Savings bank account",
   "Mobile number",
   "Nominee details"
  ],
  "how": [
   "Enrol at your bank, post office or via net banking",
   "Choose the pension slab (₹1k–₹5k)",
   "Monthly/quarterly/half-yearly auto-debit",
   "Pension starts at 60"
  ],
  "apply_url": "https://www.npscra.nsdl.co.in",
  "desc": "Government-backed pension for workers aged 18–40 in the unorganised sector; spouse gets the same pension after the subscriber.",
  "rules": {
   "age": [
    18,
    40
   ]
  }
 },
 {
  "id": "esic",
  "name": "ESIC — Employees' State Insurance",
  "name_hi": "ईएसआईसी — कर्मचारी राज्य बीमा",
  "tag": "Worker social security",
  "cats": [
   "worker",
   "health",
   "insurance"
  ],
  "benefit": "Full medical care for family + sickness, maternity & disablement cash benefits",
  "docs": [
   "Aadhaar",
   "Employer IP registration",
   "Bank account",
   "Photograph of family members"
  ],
  "how": [
   "Get enrolled by your employer as an Insured Person",
   "Generate the ESIC e-Pehchan card",
   "Visit an ESIC dispensary/hospital for free treatment",
   "Claim cash benefits via the employer"
  ],
  "apply_url": "https://www.esic.gov.in",
  "desc": "Self-financing social security for factory and establishment workers with monthly wages up to ₹21,000.",
  "rules": {
   "worker": true,
   "employed": true,
   "income_max": 300000
  }
 },
 {
  "id": "epfo-ujjwala",
  "name": "EPFO & UAN — Provident Fund Help",
  "name_hi": "ईपीएफओ व यूएएन — भविष्य निधि सहायता",
  "tag": "PF / pension account",
  "cats": [
   "worker",
   "employment",
   "pension"
  ],
  "benefit": "Universal Account Number for PF, pension (EPS) and insurance (EDLI) — check passbook & claim online",
  "docs": [
   "UAN",
   "Aadhaar",
   "PAN",
   "Bank passbook",
   "Mobile number"
  ],
  "how": [
   "Get your UAN from the employer or the EPFO member portal",
   "Activate UAN with Aadhaar & PAN",
   "Use the passbook to check balances",
   "File withdrawal / transfer claims online"
  ],
  "apply_url": "https://unifiedportal-mem.epfindia.gov.in",
  "desc": "Access your provident fund, withdraw PF advance, transfer accounts and track pension contributions.",
  "rules": {
   "employed": true,
   "worker": true
  }
 },
 {
  "id": "cybercrime",
  "name": "National Cyber Crime Reporting Portal",
  "name_hi": "राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल",
  "tag": "Online fraud reporting",
  "cats": [
   "safety",
   "rights",
   "all"
  ],
  "benefit": "Report cyber fraud 24×7 and try to freeze the money by reporting within the golden hour",
  "docs": [
   "Transaction details / screenshots",
   "Phone number used by the fraudster",
   "Bank account statement",
   "ID proof"
  ],
  "how": [
   "Call 1930 immediately for financial fraud",
   "File a complaint on cybercrime.gov.in",
   "Attach screenshots & transaction IDs",
   "Keep the acknowledgement number for follow-up"
  ],
  "apply_url": "https://cybercrime.gov.in",
  "desc": "Government portal plus the 1930 financial-fraud helpline to report and recover from online fraud.",
  "rules": {
   "any": true
  }
 },
 {
  "id": "rti",
  "name": "RTI — Right to Information",
  "name_hi": "आरटीआई — सूचना का अधिकार",
  "tag": "Ask the government anything",
  "cats": [
   "rights",
   "governance",
   "all"
  ],
  "benefit": "Any citizen can demand information from a public authority for ₹10; reply due in 30 days",
  "docs": [
   "Application with a clear question list",
   "₹10 court fee stamp / IPO / online fee",
   "Your name & address (no reason needed)"
  ],
  "how": [
   "File online on rtionline.gov.in or by post to the PIO",
   "Pay the ₹10 fee",
   "PIO must reply in 30 days (48 hours for life/liberty)",
   "If denied, file a first appeal, then the Information Commission"
  ],
  "apply_url": "https://rtionline.gov.in",
  "desc": "Legal right under the RTI Act 2005 to obtain information, records and file-notings from government offices.",
  "rules": {
   "any": true
  }
 },
 {
  "id": "cpgrams",
  "name": "CPGRAMS — Public Grievance Portal",
  "name_hi": "सीपीजीआरएएमएस — जन शिकायत पोर्टल",
  "tag": "Grievance redressal",
  "cats": [
   "rights",
   "governance",
   "all"
  ],
  "benefit": "File one grievance against any central/state department and track it to closure",
  "docs": [
   "Your complaint details with dates",
   "Supporting documents/photos",
   "Contact details"
  ],
  "how": [
   "Register on pgportal.gov.in",
   "Choose the ministry → department → describe the issue",
   "Upload evidence",
   "Escalate to the next level if the reply is unsatisfactory"
  ],
  "apply_url": "https://pgportal.gov.in",
  "desc": "Centralised Public Grievance Redress and Monitoring System with a published citizen charter & timelines.",
  "rules": {
   "any": true
  }
 },
 {
  "id": "181-112",
  "name": "181 / 112 — Women & Emergency Helplines",
  "name_hi": "181 / 112 — महिला व आपातकालीन हेल्पलाइन",
  "tag": "24×7 emergency help",
  "cats": [
   "women",
   "safety",
   "all"
  ],
  "benefit": "181 women's helpline, 112 single emergency number, 1098 childline, 1930 cyber fraud",
  "docs": [
   "None — just call"
  ],
  "how": [
   "112 for any emergency (police, fire, ambulance)",
   "181 for women in distress",
   "1098 for a child in danger",
   "1930 for financial cyber fraud"
  ],
  "apply_url": "https://112.gov.in",
  "desc": "Round-the-clock helplines that dispatch police, ambulance, fire and women/child protection services.",
  "rules": {
   "any": true
  }
 },
 {
  "id": "passport-seva",
  "name": "Passport Seva / DigiLocker",
  "name_hi": "पासपोर्ट सेवा / डिजिलॉकर",
  "tag": "Documents in your pocket",
  "cats": [
   "governance",
   "document",
   "all"
  ],
  "benefit": "Digital Aadhaar, PAN, driving licence, marksheets & insurance valid as originals + passport in 4 easy steps",
  "docs": [
   "Aadhaar (for DigiLocker sign-up)",
   "Birth certificate & address proof (for passport)"
  ],
  "how": [
   "Sign up on digilocker.gov.in with Aadhaar & mobile",
   "Fetch issuers' documents into your locker",
   "For passports register on passportindia.gov.in",
   "Pay fee, book an appointment, attend PSK/POPSK"
  ],
  "apply_url": "https://www.passportindia.gov.in",
  "desc": "Store government documents in DigiLocker (legally valid) and apply/renew passports through Passport Seva.",
  "rules": {
   "any": true
  }
 }
];

export const CONTACTS = [
 {
  "n": "112",
  "t": "All emergencies — police, fire, ambulance",
  "ic": "🚨"
 },
 {
  "n": "181",
  "t": "Women's helpline (distress, abuse, counselling)",
  "ic": "👩"
 },
 {
  "n": "1930",
  "t": "Cyber fraud — report within the golden hour",
  "ic": "💳"
 },
 {
  "n": "1098",
  "t": "Childline — child in danger or need of care",
  "ic": "🧒"
 },
 {
  "n": "14555",
  "t": "Ayushman Bharat / health scheme helpdesk",
  "ic": "🏥"
 },
 {
  "n": "155261",
  "t": "PM-Kisan helpdesk (farmer queries)",
  "ic": "🌾"
 },
 {
  "n": "1800-180-6127",
  "t": "NSP scholarship helpline",
  "ic": "🎓"
 },
 {
  "n": "1800-11-4000",
  "t": "National consumer helpline",
  "ic": "🛒"
 },
 {
  "n": "1800-11-1555",
  "t": "Senior citizen helpline (Elderline)",
  "ic": "🧓"
 },
 {
  "n": "1800-180-5522",
  "t": "MGNREGA grievance helpline",
  "ic": "🛠️"
 },
 {
  "n": "1912",
  "t": "Electricity complaint / connections",
  "ic": "💡"
 },
 {
  "n": "1800-180-6768",
  "t": "Antyodaya / National Food Security helpline",
  "ic": "🍚"
 }
];

export const GLOSSARY = [
 {
  "term": "PIO",
  "def": "Public Information Officer — the official who must answer your RTI request."
 },
 {
  "term": "DBT",
  "def": "Direct Benefit Transfer — money sent straight to your bank account, no middleman."
 },
 {
  "term": "e-KYC",
  "def": "Electronic Know Your Customer — Aadhaar + OTP based identity verification."
 },
 {
  "term": "CSC",
  "def": "Common Service Centre — a local shop that files government applications for you."
 },
 {
  "term": "ULB",
  "def": "Urban Local Body — your municipal corporation or nagar palika office."
 },
 {
  "term": "Gram Panchayat",
  "def": "The elected village council — the starting point for most rural schemes."
 },
 {
  "term": "SECC",
  "def": "Socio Economic and Caste Census — the listing many welfare schemes are based on."
 },
 {
  "term": "UDID",
  "def": "Unique Disability ID card issued to persons with disabilities."
 },
 {
  "term": "Job Card",
  "def": "MGNREGA household card that guarantees work on demand."
 },
 {
  "term": "MCP Card",
  "def": "Mother & Child Protection card — tracks pregnancy and child health."
 }
];

export const KB_TEXT = "### PM Kisan Samman Nidhi / पीएम किसान सम्मान निधि [Farmer income support]\nbenefit: ₹6,000 / year in 3 instalments directly to your bank account\ndetails: Direct income support for all landholding farmer families to buy seeds, fertiliser and meet input costs.\ndocuments: Aadhaar, Land record (khatauni / 7-12 extract), Bank passbook, Mobile number linked to Aadhaar\nsteps: Visit your nearest CSC (Common Service Centre) or the PM-Kisan portal -> Complete e-KYC with Aadhaar & OTP -> Upload land record details -> Track instalments on the portal by Aadhaar number\nofficial: https://pmkisan.gov.in\neligibility data: {\"farmer\":true,\"land_acres\":[0.01,100],\"age\":[18,120],\"max_income\":600000}\n\n### PM Kisan Maandhan Yojana / पीएम किसान मानधन योजना [Farmer pension]\nbenefit: ₹3,000 monthly pension after age 60\ndetails: Voluntary contributory pension for small & marginal farmers (land up to 2 hectares).\ndocuments: Aadhaar, Bank passbook, Land record, Age proof\nsteps: Enrol at your nearest CSC -> Choose a monthly contribution between ₹55 and ₹200 -> Contribute till age 60 -> Receive pension from the LIC-administered fund\nofficial: https://maandhan.in\neligibility data: {\"farmer\":true,\"land_acres\":[0.01,5],\"age\":[18,40]}\n\n### PM Shram Yogi Maan-Dhan / पीएम श्रम योगी मानधन [Unorganised worker pension]\nbenefit: ₹3,000 monthly pension after age 60\ndetails: Old-age protection for unorganised workers such as street vendors, drivers, guards, helpers.\ndocuments: Aadhaar, Savings bank account, Mobile number\nsteps: Find enrolment centre on maandhan.in -> Contribute ₹55–₹200 monthly -> Co-contribution from Government is equal -> Pension starts at 60\nofficial: https://maandhan.in\neligibility data: {\"worker\":true,\"age\":[18,40],\"max_income\":200000}\n\n### Ration Card (NFSA / On-e-KYC) / राशन कार्ड (राष्ट्रीय खाद्य सुरक्षा) [Food security]\nbenefit: 5 kg free grain per person per month (rice/wheat) + pulses\ndetails: Priority Household / Antyodaya ration entitlement delivered through the Public Distribution System.\ndocuments: Aadhaar of all members, Residence proof, Income certificate, Ration card application form\nsteps: Apply at the district Food & Civil Supplies office or online state portal -> e-KYC at the fair price shop -> Card issued within 30 days -> Collect monthly grain with Aadhaar authentication\nofficial: https://dfpd.gov.in\neligibility data: {\"bpl\":true,\"income_max\":250000,\"family\":true}\n\n### PM Ujjwala Yojana 2.0 / पीएम उज्ज्वला योजना 2.0 [Clean cooking fuel]\nbenefit: Free LPG connection + first refill & stove free\ndetails: Deposit-free LPG connection for women from poor households to replace smoky chulhas.\ndocuments: Aadhaar, Ration card / BPL proof, Bank passbook, Address proof\nsteps: Apply at any LPG distributor or on pmuy.gov.in -> Choose an oil company (Indane/Bharat/HP) -> KYC verification -> Get connection in about a week\nofficial: https://www.pmuy.gov.in\neligibility data: {\"bpl\":true,\"women\":true,\"family\":true,\"income_max\":300000}\n\n### Jal Jeevan Mission — Tap Water / जल जीवन मिशन — नल जल [Safe drinking water]\nbenefit: Functional household tap connection with 55 litres/day per person\ndetails: Piped drinking water to every rural household; village-level reporting and grievance redress.\ndocuments: Ration card / village residence proof, Aadhaar, Gram Panchayat request\nsteps: Ask your Gram Panchayat / PHE department for a new connection -> Verify the village IMIS status on the portal -> Report a non-functional tap on the portal -> Track works at village level\nofficial: https://jaljeevanmission.gov.in\neligibility data: {\"rural\":true,\"family\":true}\n\n### PM Awas Yojana — Gramin / पीएम आवास योजना — ग्रामीण [Rural housing]\nbenefit: Up to ₹1.30 lakh assistance to build a pucca house + MGNREGA labour wages\ndetails: Assistance for homeless families and those living in kutcha/dilapidated houses in rural areas.\ndocuments: Aadhaar, Job card / SECC listing, Bank passbook, Land documents\nsteps: Check your name in the SECC/awaas+ beneficiary list -> Apply through Gram Panchayat -> Geo-tagging of construction stages -> Instalments released in 3–4 tranches\nofficial: https://pmayg.nic.in\neligibility data: {\"rural\":true,\"housing\":\"kutcha\",\"income_max\":600000}\n\n### PM Awas Yojana — Urban / PMAY-U 2.0 / पीएम आवास योजना — शहरी [Urban housing]\nbenefit: Interest subsidy up to ₹1.80 lakh on home loan (up to ₹6.5 lakh subsidy for affordable homes)\ndetails: Affordable housing for the urban poor — beneficiary-led construction, affordable rental housing and interest subsidy.\ndocuments: Aadhaar, Income certificate, Bank account / loan sanction letter, Self-declaration of no pucca house\nsteps: Apply on pmay-urban.gov.in or via your ULB -> Check eligibility for the CLSS interest subsidy -> Bank submits the subsidy claim -> Subsidy credited to your loan account\nofficial: https://pmay-urban.gov.in\neligibility data: {\"urban\":true,\"housing\":\"kutcha\",\"income_max\":900000}\n\n### Saubhagya — Free Electricity Connection / सौभाग्य — मुफ्त बिजली कनेक्शन [Household electrification]\nbenefit: Free electricity connection (worth ~₹3,000) + wiring & meter free for BPL families\ndetails: Last-mile electrification of un-electrified households under the Saubhagya / RDSS programmes.\ndocuments: Aadhaar, BPL card, Address proof\nsteps: Contact the local DISCOM camp or panchayat -> Physical verification of BPL status -> Meter installed free for BPL -> Grievance: 1912 helpline\nofficial: https://powermin.gov.in\neligibility data: {\"bpl\":true,\"rural\":true,\"family\":true}\n\n### Ayushman Bharat (PM-JAY) / आयुष्मान भारत (पीएम-जय) [Hospital insurance]\nbenefit: ₹5 lakh per family per year cashless hospitalisation + ₹5 lakh for all citizens aged 70+\ndetails: World's largest health assurance scheme covering secondary & tertiary hospital care at empanelled hospitals.\ndocuments: Aadhaar, Ration card / SECC listing, Ayushman card (e-KYC)\nsteps: Check your name at beneficiary.nha.gov.in or the Ayushman app -> Complete e-KYC at a CSC / hospital -> Download the Ayushman card -> Show it at any empanelled hospital for cashless care\nofficial: https://beneficiary.nha.gov.in\neligibility data: {\"bpl\":true,\"health\":true,\"age_min_any\":70,\"income_max\":400000}\n\n### PM Jan Aushadhi — Generic Medicines / पीएम जन औषधि — जेनेरिक दवाएं [Affordable medicines]\nbenefit: Quality generic medicines at 50–90% lower price + ₹5 Suvidha sanitary pads\ndetails: Generic medicine outlets across the country so treatment does not push families into debt.\ndocuments: Doctor's prescription (no documents needed for purchase)\nsteps: Find the nearest Janaushadhi Kendra on the portal -> Show your prescription -> Buy generics at 50–90% less -> Ask for the Janaushadhi Sugam app to compare prices\nofficial: https://janaushadhi.gov.in\neligibility data: {\"any\":true}\n\n### Janani Suraksha Yojana / जननी सुरक्षा योजना [Maternal health]\nbenefit: ₹1,400 cash (rural) / ₹1,000 (urban) for institutional delivery + free delivery care\ndetails: Safe motherhood intervention promoting institutional delivery among poor pregnant women.\ndocuments: Aadhaar, MCP card, BPL / SC-ST / JSY card, Bank passbook\nsteps: Register at the nearest ASHA / ANM / PHC -> Get at least 3 antenatal check-ups -> Deliver at a government facility -> Cash is transferred to your bank account\nofficial: https://nhm.gov.in\neligibility data: {\"women\":true,\"bpl\":true,\"age\":[19,49]}\n\n### Pradhan Mantri Surakshit Matritva Abhiyan / प्रधानमंत्री सुरक्षित मातृत्व अभियान [Free pregnancy check-up]\nbenefit: Free comprehensive antenatal check-up on the 9th of every month\ndetails: Assured free antenatal care by specialists for every pregnant woman on the 9th of each month.\ndocuments: MCP card, Aadhaar (optional)\nsteps: Visit a government PHC/CHC on the 9th -> Carry your MCP card -> Get tests, ultrasound referral & medicines free -> High-risk cases are tracked by name\nofficial: https://pmsma.mohfw.gov.in\neligibility data: {\"women\":true,\"pregnant\":true}\n\n### Ni-kshay Poshan Yojana (TB Support) / निक्षय पोषण योजना (टीबी सहायता) [TB nutrition support]\nbenefit: ₹1,000 per month nutritional support for the full TB treatment period\ndetails: Direct benefit transfer for every notified TB patient to improve nutrition and treatment outcomes.\ndocuments: Aadhaar, Bank passbook, TB notification at the health facility\nsteps: Get notified as a TB patient at any government facility -> Register on the Ni-kshay portal -> Bank account is linked -> Monthly DBT is credited till completion\nofficial: https://nikshay.in\neligibility data: {\"any\":true,\"tb\":true}\n\n### Sukanya Samriddhi Yojana / सुकन्या समृद्धि योजना [Girl child savings]\nbenefit: Highest small-savings interest (~8.2%) + full tax benefit (80C) on deposits\ndetails: Small deposit scheme for a girl child below 10 years, maturity after 21 years or on marriage after 18.\ndocuments: Birth certificate of girl, Aadhaar of guardian, Address proof, Photograph\nsteps: Open at any post office or authorised bank -> Minimum ₹250, maximum ₹1.5 lakh per year -> Deposit for 15 years, matures in 21 years -> Partial withdrawal allowed for higher education after 18\nofficial: https://www.indiapost.gov.in\neligibility data: {\"girl_child\":true,\"child_age\":[0,10]}\n\n### Beti Bachao Beti Padhao / बेटी बचाओ बेटी पढ़ाओ [Girl child empowerment]\nbenefit: Survival, protection & education support for the girl child (state-level cash incentives)\ndetails: National campaign plus state incentive schemes that reward girl-child education milestones.\ndocuments: Birth certificate, Aadhaar, Bank account in the girl's name, School/college certificate\nsteps: Ask your school/anganwadi about the state girls' incentive scheme -> Submit bank details & certificates -> Incentive credited at each educational milestone -> Helpline 181 for support\nofficial: https://wcd.gov.in\neligibility data: {\"girl_child\":true}\n\n### Kanya Sumangala / State Girl-Child Scheme / कन्या सुमंगला योजना [Girl child cash support]\nbenefit: Up to ₹25,000 in 6 stages from birth to graduation (varies by state)\ndetails: State-level multi-stage cash transfer for the girl child of poor families — a model now copied by several states.\ndocuments: Aadhaar of parents & child, Birth certificate, Income certificate, Bank account in child's name\nsteps: Apply on your state's girl-child scheme portal -> Complete verification at the block office -> Amount released at each stage -> Renewal needs school certificate each stage\nofficial: https://wcd.gov.in\neligibility data: {\"girl_child\":true,\"income_max\":300000,\"bpl\":true}\n\n### PMMVY — Maternity Benefit / प्रधानमंत्री मातृ वंदना योजना [Maternity cash benefit]\nbenefit: ₹5,000 cash for the first living child (₹6,000 for the second if a girl)\ndetails: Wage compensation for pregnant/lactating mothers to meet nutrition and delivery needs.\ndocuments: Aadhaar, MCP card, Bank passbook, Age proof (19+)\nsteps: Apply at the nearest Anganwadi / ASHA centre -> Submit MCP card & bank details -> Verification by the CDPO -> Amount transferred in one or two instalments\nofficial: https://pmmvy.wcd.gov.in\neligibility data: {\"women\":true,\"age\":[19,49],\"pregnant\":true,\"income_max\":300000}\n\n### Indira Gandhi National Widow Pension / इंदिरा गांधी राष्ट्रीय विधवा पेंशन [Widow pension]\nbenefit: ₹300 (central share) + topped up by states — often ₹1,000–₹2,000 monthly\ndetails: Monthly pension for widows from BPL households, aged 18–79 (NSAP).\ndocuments: Aadhaar, Death certificate of spouse, BPL card, Bank passbook\nsteps: Apply at the Block / Tehsil Social Welfare office or the state NSAP portal -> Attach spouse's death certificate -> Bank account seeding with Aadhaar -> Pension credited monthly\nofficial: https://nsap.nic.in\neligibility data: {\"women\":true,\"widow\":true,\"bpl\":true,\"age\":[18,79]}\n\n### ADIP — Aids & Assistive Devices / एडीआईपी — सहायक उपकरण योजना [Assistive devices]\nbenefit: Free or subsidised wheelchairs, hearing aids, prosthetics, smart canes\ndetails: Assistance for purchasing aids and appliances for persons with disabilities as per the ADIP scheme norms.\ndocuments: Disability certificate (UDID), Aadhaar, Income certificate\nsteps: Register on the ADIP/SAMARTH portal -> Attend the assessment camp -> Choose the prescribed device -> Device delivered free or at 10% cost above the income threshold\nofficial: https://www.adip.gov.in\neligibility data: {\"disability\":true,\"income_max\":400000}\n\n### Indira Gandhi National Disability Pension / इंदिरा गांधी राष्ट्रीय दिव्यांग पेंशन [Disability pension]\nbenefit: ₹300 central + state top-up monthly for 80%+ disability\ndetails: Monthly pension for severely disabled persons from BPL households aged 18–79 (NSAP).\ndocuments: UDID / disability certificate, Aadhaar, BPL card, Bank passbook\nsteps: Apply at the Block Social Welfare office or state NSAP portal -> Attach UDID certificate -> Verification within 30 days -> Monthly pension to bank account\nofficial: https://nsap.nic.in\neligibility data: {\"disability\":true,\"bpl\":true,\"age\":[18,79]}\n\n### Indira Gandhi National Old Age Pension / इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन [Old-age pension]\nbenefit: ₹200 (60–79 yrs) / ₹500 (80+) central + state top-up, monthly\ndetails: Monthly pension for BPL persons aged 60 and above under the National Social Assistance Programme.\ndocuments: Aadhaar, Age proof, BPL card, Bank passbook\nsteps: Apply at the Block/Tehsil office or state NSAP portal -> Age & BPL verification -> Aadhaar seeding of bank account -> Monthly DBT credit\nofficial: https://nsap.nic.in\neligibility data: {\"senior\":true,\"bpl\":true,\"age\":[60,120]}\n\n### Rashtriya Vayoshri Yojana / राष्ट्रीय वयोश्री योजना [Elderly assistive devices]\nbenefit: Free walking sticks, walkers, hearing aids, dentures, spectacles\ndetails: Assistive living devices distributed free to senior citizens with age-related disabilities from BPL households.\ndocuments: Aadhaar (60+), BPL card, Medical assessment\nsteps: Watch for the ALIMCO assessment camp in your district -> Attend with Aadhaar & BPL card -> Devices assessed & distributed free -> Track camps on the ALIMCO site\nofficial: https://www.alimco.in\neligibility data: {\"senior\":true,\"bpl\":true,\"age\":[60,120]}\n\n### National Scholarship Portal — Scholarships / राष्ट्रीय छात्रवृत्ति पोर्टल [Scholarships]\nbenefit: Pre-matric, post-matric & merit scholarships — ₹5,000 to ₹2 lakh per year\ndetails: Single-window portal for 80+ central & state scholarships for SC/ST/OBC/minority/girl/PwD students.\ndocuments: Aadhaar, Income certificate, Caste certificate (if applicable), Marksheet / bonafide certificate, Bank passbook\nsteps: Register on scholarships.gov.in with Aadhaar -> Choose all scholarships you qualify for -> Upload documents, submit before the deadline -> Track status & renew each year\nofficial: https://scholarships.gov.in\neligibility data: {\"student\":true,\"income_max\":800000}\n\n### PM Vidyalaxmi — Education Loan / पीएम विद्यालक्ष्मी — शिक्षा ऋण [Education loan]\nbenefit: Collateral-free education loan up to ₹10 lakh with 3% interest subvention\ndetails: Single-window portal for collateral-free, guarantor-free education loans to meritorious students.\ndocuments: Aadhaar, Admission letter of institution, Fee structure, Class 12 marksheet, Income proof\nsteps: Register on the Vidya Lakshmi portal -> Fill one common form for multiple banks -> Compare offers, accept one -> Interest subvention applies for family income under ₹8 lakh\nofficial: https://www.vidyalakshmi.co.in\neligibility data: {\"student\":true,\"income_max\":800000}\n\n### Skill India / PMKVY / स्किल इंडिया / पीएमकेवीवाई [Free skill training]\nbenefit: Free short-term training + assessment fee paid + placement assistance\ndetails: Short-term skill certification in 300+ trades for school/college dropouts and job seekers.\ndocuments: Aadhaar, Education certificate, Bank account, Photograph\nsteps: Search courses on skillindia.gov.in / PMKVY portal -> Enrol at the nearest training centre -> Attend free training of 150–300 hours -> Pass the assessment for certification & placement support\nofficial: https://www.skillindia.gov.in\neligibility data: {\"age\":[15,45],\"student_or_worker\":true}\n\n### National Apprenticeship Promotion Scheme / राष्ट्रीय प्रशिक्षुता प्रोत्साहन योजना [Paid apprenticeship]\nbenefit: Stipend up to ₹9,000/month; Govt pays 25% (up to ₹1,500) of the stipend\ndetails: Apprenticeship training in industry with a stipend, leading to a recognized qualification and often a job.\ndocuments: Aadhaar, Educational certificates, Bank account\nsteps: Register as a candidate on apprenticeshipindia.gov.in -> Apply to establishments hiring apprentices -> Sign the apprenticeship contract -> Get a stipend while you learn\nofficial: https://www.apprenticeshipindia.gov.in\neligibility data: {\"age\":[14,40],\"student_or_worker\":true}\n\n### DDU-GKY — Rural Youth Placement / डीडीयू-जीकेवाई — ग्रामीण युवा रोजगार [Placement-linked training]\nbenefit: Free residential training + guaranteed placement + travel support\ndetails: Placement-linked skill development for rural poor youth aged 15–35 under the Ministry of Rural Development.\ndocuments: Aadhaar, Age proof, Rural residence / MGNREGA job card, Education certificate\nsteps: Contact the DDU-GKY project officer at your district -> Enrol in a residential course -> Complete training with stipend -> Get placed with post-placement support\nofficial: https://ddugky.gov.in\neligibility data: {\"age\":[15,35],\"rural\":true,\"income_max\":400000}\n\n### MGNREGA — Guaranteed Rural Work / मनरेगा — ग्रामीण रोजगार गारंटी [140 days guaranteed work]\nbenefit: 100–150 days of unskilled work per household per year, paid weekly at the notified wage\ndetails: Legally guaranteed rural employment — demand work, get a receipt, and if not given within 15 days an unemployment allowance is due.\ndocuments: Aadhaar, Ration card, Rural residence proof, Bank/post office passbook, Photograph\nsteps: Apply for a Job Card at the Gram Panchayat (free, 15-day deadline) -> Submit a written work demand -> Get a dated receipt — that is your proof -> Wages to your bank account within 15 days\nofficial: https://nrega.nic.in\neligibility data: {\"rural\":true,\"age\":[18,120]}\n\n### PM MUDRA Yojana / पीएम मुद्रा योजना [Collateral-free business loan]\nbenefit: Loans up to ₹20 lakh (Tarun Plus) with no collateral, for income-generating activity\ndetails: Micro-loans under Shishu (₹50k), Kishore (₹5L), Tarun (₹10L) and Tarun Plus (₹20L) for non-farm enterprises.\ndocuments: Aadhaar, PAN, Business plan / quotation, Bank statement, Address proof\nsteps: Approach any bank / NBFC / MFI with the Jan Samarth portal -> Submit your business plan -> Choose the Shishu/Kishore/Tarun slab -> Loan sanctioned without collateral\nofficial: https://www.jansamarth.in\neligibility data: {\"business\":true,\"age\":[18,70]}\n\n### PM SVANidhi — Street Vendor Loan / पीएम स्वनिधि — रेहड़ी-पटरी ऋण [Street vendor micro-loan]\nbenefit: Working capital ₹10,000 → ₹20,000 → ₹50,000 across cycles + 7% interest subsidy\ndetails: Collateral-free working capital loans for street vendors with a certificate of vending or a letter of recommendation.\ndocuments: Aadhaar, Certificate of Vending / ULB recommendation, Bank passbook, Photograph\nsteps: Apply on pmsvanidhi.mohua.gov.in -> Get the Certificate of Vending from your ULB -> Bank sanctions the loan -> Repay on time to unlock the next, larger cycle\nofficial: https://pmsvanidhi.mohua.gov.in\neligibility data: {\"urban\":true,\"worker\":true,\"age\":[18,70]}\n\n### Stand-Up India / स्टैंड-अप इंडिया [First-time entrepreneur loan]\nbenefit: ₹10 lakh to ₹1 crore composite loan at a concessional rate for greenfield enterprises\ndetails: Bank loans for SC/ST and women entrepreneurs setting up a manufacturing, service or trading enterprise.\ndocuments: Aadhaar, PAN, Caste certificate (SC/ST), Business plan & quotations, Bank statement\nsteps: Apply on the Stand-Up India portal or at any bank branch -> Submit project report & machinery quotations -> Bank appraises and sanctions -> Repay in 7 years with up to 18 months moratorium\nofficial: https://www.standupmitra.in\neligibility data: {\"business\":true,\"sc_st_or_woman\":true,\"age\":[18,70]}\n\n### PMEGP — Prime Minister's Employment Generation Programme / पीएमईजीपी — रोजगार सृजन कार्यक्रम [Subsidised micro-enterprise]\nbenefit: Up to 35% margin money subsidy on project cost up to ₹50 lakh (manufacturing)\ndetails: Credit-linked subsidy for setting up manufacturing or service micro-enterprises generating self-employment.\ndocuments: Aadhaar, Education certificate (8th pass for projects above ₹10 lakh), Project report, Caste/special category certificate\nsteps: Apply online on the KVIC PMEGP e-portal -> Attend the district task force interview -> Bank sanctions the balance loan -> Subsidy is adjusted in the loan account\nofficial: https://www.kviconline.gov.in/pmegpeportal\neligibility data: {\"business\":true,\"age\":[18,70]}\n\n### PM Jeevan Jyoti Bima Yojana / पीएम जीवन ज्योति बीमा योजना [₹2 lakh life cover]\nbenefit: ₹2 lakh life insurance for just ₹436 per year\ndetails: Renewable one-year life insurance for bank account holders aged 18–50.\ndocuments: Aadhaar, Bank account, Auto-debit consent form\nsteps: Submit the consent form at your bank / post office or via net banking -> Premium auto-debited each year -> Cover continues as long as premium is paid (till 55) -> Claim by the nominee\nofficial: https://jansuraksha.gov.in\neligibility data: {\"age\":[18,50],\"any\":true}\n\n### PM Suraksha Bima Yojana / पीएम सुरक्षा बीमा योजना [₹2 lakh accident cover]\nbenefit: ₹2 lakh accidental death & disability cover for ₹20 per year\ndetails: Accident insurance giving ₹2 lakh for accidental death/total disability and ₹1 lakh for partial disability.\ndocuments: Aadhaar, Bank account, Consent-cum-auto-debit form\nsteps: Sign the form at your bank or through net banking -> ₹20 auto-debited annually -> Cover is 1 June – 31 May each year -> File the claim with the police/medical record\nofficial: https://jansuraksha.gov.in\neligibility data: {\"age\":[18,70],\"any\":true}\n\n### Atal Pension Yojana / अटल पेंशन योजना [Guaranteed pension]\nbenefit: Assured pension of ₹1,000–₹5,000 per month after 60\ndetails: Government-backed pension for workers aged 18–40 in the unorganised sector; spouse gets the same pension after the subscriber.\ndocuments: Aadhaar, Savings bank account, Mobile number, Nominee details\nsteps: Enrol at your bank, post office or via net banking -> Choose the pension slab (₹1k–₹5k) -> Monthly/quarterly/half-yearly auto-debit -> Pension starts at 60\nofficial: https://www.npscra.nsdl.co.in\neligibility data: {\"age\":[18,40]}\n\n### ESIC — Employees' State Insurance / ईएसआईसी — कर्मचारी राज्य बीमा [Worker social security]\nbenefit: Full medical care for family + sickness, maternity & disablement cash benefits\ndetails: Self-financing social security for factory and establishment workers with monthly wages up to ₹21,000.\ndocuments: Aadhaar, Employer IP registration, Bank account, Photograph of family members\nsteps: Get enrolled by your employer as an Insured Person -> Generate the ESIC e-Pehchan card -> Visit an ESIC dispensary/hospital for free treatment -> Claim cash benefits via the employer\nofficial: https://www.esic.gov.in\neligibility data: {\"worker\":true,\"employed\":true,\"income_max\":300000}\n\n### EPFO & UAN — Provident Fund Help / ईपीएफओ व यूएएन — भविष्य निधि सहायता [PF / pension account]\nbenefit: Universal Account Number for PF, pension (EPS) and insurance (EDLI) — check passbook & claim online\ndetails: Access your provident fund, withdraw PF advance, transfer accounts and track pension contributions.\ndocuments: UAN, Aadhaar, PAN, Bank passbook, Mobile number\nsteps: Get your UAN from the employer or the EPFO member portal -> Activate UAN with Aadhaar & PAN -> Use the passbook to check balances -> File withdrawal / transfer claims online\nofficial: https://unifiedportal-mem.epfindia.gov.in\neligibility data: {\"employed\":true,\"worker\":true}\n\n### National Cyber Crime Reporting Portal / राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल [Online fraud reporting]\nbenefit: Report cyber fraud 24×7 and try to freeze the money by reporting within the golden hour\ndetails: Government portal plus the 1930 financial-fraud helpline to report and recover from online fraud.\ndocuments: Transaction details / screenshots, Phone number used by the fraudster, Bank account statement, ID proof\nsteps: Call 1930 immediately for financial fraud -> File a complaint on cybercrime.gov.in -> Attach screenshots & transaction IDs -> Keep the acknowledgement number for follow-up\nofficial: https://cybercrime.gov.in\neligibility data: {\"any\":true}\n\n### RTI — Right to Information / आरटीआई — सूचना का अधिकार [Ask the government anything]\nbenefit: Any citizen can demand information from a public authority for ₹10; reply due in 30 days\ndetails: Legal right under the RTI Act 2005 to obtain information, records and file-notings from government offices.\ndocuments: Application with a clear question list, ₹10 court fee stamp / IPO / online fee, Your name & address (no reason needed)\nsteps: File online on rtionline.gov.in or by post to the PIO -> Pay the ₹10 fee -> PIO must reply in 30 days (48 hours for life/liberty) -> If denied, file a first appeal, then the Information Commission\nofficial: https://rtionline.gov.in\neligibility data: {\"any\":true}\n\n### CPGRAMS — Public Grievance Portal / सीपीजीआरएएमएस — जन शिकायत पोर्टल [Grievance redressal]\nbenefit: File one grievance against any central/state department and track it to closure\ndetails: Centralised Public Grievance Redress and Monitoring System with a published citizen charter & timelines.\ndocuments: Your complaint details with dates, Supporting documents/photos, Contact details\nsteps: Register on pgportal.gov.in -> Choose the ministry → department → describe the issue -> Upload evidence -> Escalate to the next level if the reply is unsatisfactory\nofficial: https://pgportal.gov.in\neligibility data: {\"any\":true}\n\n### 181 / 112 — Women & Emergency Helplines / 181 / 112 — महिला व आपातकालीन हेल्पलाइन [24×7 emergency help]\nbenefit: 181 women's helpline, 112 single emergency number, 1098 childline, 1930 cyber fraud\ndetails: Round-the-clock helplines that dispatch police, ambulance, fire and women/child protection services.\ndocuments: None — just call\nsteps: 112 for any emergency (police, fire, ambulance) -> 181 for women in distress -> 1098 for a child in danger -> 1930 for financial cyber fraud\nofficial: https://112.gov.in\neligibility data: {\"any\":true}\n\n### Passport Seva / DigiLocker / पासपोर्ट सेवा / डिजिलॉकर [Documents in your pocket]\nbenefit: Digital Aadhaar, PAN, driving licence, marksheets & insurance valid as originals + passport in 4 easy steps\ndetails: Store government documents in DigiLocker (legally valid) and apply/renew passports through Passport Seva.\ndocuments: Aadhaar (for DigiLocker sign-up), Birth certificate & address proof (for passport)\nsteps: Sign up on digilocker.gov.in with Aadhaar & mobile -> Fetch issuers' documents into your locker -> For passports register on passportindia.gov.in -> Pay fee, book an appointment, attend PSK/POPSK\nofficial: https://www.passportindia.gov.in\neligibility data: {\"any\":true}";
