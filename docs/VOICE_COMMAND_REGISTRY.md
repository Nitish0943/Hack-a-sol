# KrishiSetu Voice Command Registry & Allowlist

The voice assistant enforces a centralized command allowlist. Only registered actions with pre-declared role mappings can be triggered.

## 1. Registered Voice Commands

| Action Key | Category | Supported Roles | Target Route (Farmer / Officer / Admin) | Natural Phrasing (EN / HI / Hinglish) |
|---|---|---|---|---|
| `navigate_to_profile` | `navigation` | All | `/farmer/profile`<br>`/officer/dashboard`<br>`/admin/dashboard` | "Open my profile", "Go to profile", "मेरा प्रोफाइल खोलो", "Profile kholo" |
| `navigate_to_dashboard` | `navigation` | All | `/farmer/dashboard`<br>`/officer/dashboard`<br>`/admin/dashboard` | "Go to dashboard", "Home page", "डैशबोर्ड खोलो", "Dashboard par jao" |
| `navigate_to_schemes` | `navigation` | All | `/farmer/schemes`<br>`/officer/dashboard`<br>`/admin/schemes` | "Open recommended schemes", "Show schemes", "योजनाएं खोलो", "Yojana suchi" |
| `navigate_to_applications` | `navigation` | All | `/farmer/applications`<br>`/officer/applications`<br>`/admin/dashboard` | "Show my applications", "Application tracking", "आवेदन खोलो", "Mere aavedan dikhao" |
| `navigate_to_benefits` | `navigation` | All | `/farmer/benefits`<br>`/officer/dashboard`<br>`/admin/dashboard` | "Show my benefits", "Financial twin", "वित्तीय विवरण खोलो", "Mera paisa kahan hai" |
| `navigate_to_calculator` | `navigation` | All | `/farmer/calculator`<br>`/officer/dashboard`<br>`/admin/dashboard` | "Open loan calculator", "Open calculator", "कैलकुलेटर खोलो", "Calculator par jao" |
| `navigate_to_eligibility` | `navigation` | All | `/farmer/eligibility`<br>`/officer/dashboard`<br>`/admin/dashboard` | "Check eligibility", "Eligibility tool", "पात्रता जांच पृष्ठ खोलो", "Patrata janch" |
| `navigate_to_grievances` | `navigation` | All | `/farmer/grievances`<br>`/officer/grievances`<br>`/admin/dashboard` | "Show my grievances", "Grievance page", "शिकायत पृष्ठ खोलो", "Meri shikayat dikhao" |
| `navigate_to_notifications` | `navigation` | All | `/farmer/notifications`<br>`/officer/dashboard`<br>`/admin/dashboard` | "Open notifications", "Notification center", "सूचनाएं खोलो", "Suchnayein dikhao" |
| `get_personalized_loans` | `personalized_info` | Farmer | UI Cards | "Which loan can I apply for?", "Main kaunsa loan le sakta hoon?", "कृषि ऋण विकल्प", "Krishi rin" |
| `get_loan_application_guidance` | `action` | All | Application Channel Card | "Where can I apply?", "Apply kahan se kare?", "कहाँ से आवेदन करें?", "Official link" |
| `check_subsidy_eligibility` | `personalized_info` | Farmer | UI Cards | "Am I eligible for any subsidy?", "Saur sujala pump subsidy", "क्या मुझे सब्सिडी मिलेगी?", "Anudan mil sakta" |
| `get_personalized_recommendations` | `personalized_info` | Farmer | UI Cards | "Which schemes are suitable for me?", "Mere liye kaun si yojana hai?", "मेरे लिए कौन सी योजना है?" |
| `get_farmer_benefits` | `personalized_info` | Farmer | Data Breakdown | "How much financial assistance can I receive?", "Kitna labh mil sakta?", "कितनी वित्तीय सहायता मिलेगी?" |
| `get_missing_documents` | `personalized_info` | Farmer | Document Checklist | "What documents are missing from my profile?", "Kya kagaz chahiye?", "कौन से दस्तावेज बाकी हैं?" |
| `get_application_status` | `personalized_info` | Farmer | Status Cards | "What is the status of my application?", "Mera aavedan status dikhao", "मेरे आवेदन की स्थिति क्या है?" |
| `get_grievance_status` | `personalized_info` | Farmer | Grievance Cards | "What happened to my grievance?", "Shikayat ki sthiti", "मेरी शिकायत पर क्या हुआ?" |
| `explain_scheme` | `explanation` | All | Educational Text | "What is Kisan Credit Card?", "Explain KCC", "केसीसी क्या है?", "Sanctioned vs disbursed" |

---

## 2. Verified Loan Product Channels

The assistant provides verified physical and online application guidance for the following products:

| Loan Product | Provider | Category | Official Portal URL | Physical Channel |
|---|---|---|---|---|
| **Kisan Credit Card (KCC)** | Government of India / RBI | Short-term Crop Production Credit | https://agricoop.nic.in/en/kcc | Commercial Banks (SBI, BoB, PNB), RRBs, or local PACS |
| **SBI Kisan Gold Card** | State Bank of India | Term Loan & Mechanization | https://sbi.co.in/web/agri-rural/agriculture-banking/crop-finance/kisan-gold-card | Nearest SBI Rural/Semi-Urban Agri Commercial Branch |
| **Baroda Kisan Credit Card** | Bank of Baroda | Flexible Agri Working Capital | https://www.bankofbaroda.in/business-banking/rural-agri/loans-and-advances/baroda-kisan-credit-card | Bank of Baroda branch or Baroda Kisan digital app |
| **Mahindra Tractor & Implement Loan** | Mahindra Finance | Farm Mechanization Equipment | https://mahindrafinance.com/tractor-loans | Authorized Mahindra Tractor dealerships or branch |
| **HDFC Drip & Micro Irrigation Loan** | HDFC Bank | Irrigation Infrastructure | https://www.hdfcbank.com/personal/borrow/popular-loans/agriculture-loans | HDFC Bank branch or registered drip irrigation vendors |
| **Bajaj Allianz Crop Insurance** | Bajaj Allianz | Yield & Weather Risk Cover | https://pmfby.gov.in | Common Service Centers (CSC) or PMFBY portal |
| **Tenant Cultivator Joint Liability Line** | NABARD / State Coop | Landless & Tenant Crop Line | https://www.nabard.org/content1.aspx?id=594 | District Central Cooperative Bank (DCCB) or PACS |
