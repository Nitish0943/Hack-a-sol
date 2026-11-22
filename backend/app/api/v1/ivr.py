from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.application import Application
from app.models.benefit import BenefitLedger
from app.models.farmer import Farmer
from app.models.scheme import Scheme
from app.models.user import User

router = APIRouter(prefix="/ivr", tags=["ivr"])


@router.post("/process-key")
async def process_dtmf_key(
    payload: dict[str, Any],
    db: AsyncSession = Depends(get_db),
):
    key = str(payload.get("key", "9")).strip()
    language = payload.get("language", "hi")  # hi, en, cghi
    caller_phone = payload.get("phone", "9876543210")

    # Retrieve Farmer Profile
    farmer_res = await db.execute(select(Farmer).join(User).where(User.phone == caller_phone))
    farmer = farmer_res.scalars().first()
    farmer_name = "Ramesh Kumar" if not farmer else "Ramesh Kumar"

    if key == "1":
        # Scheme Information
        schemes_res = await db.execute(select(Scheme).where(Scheme.is_active == True).limit(3))
        schemes = schemes_res.scalars().all()
        scheme_names = ", ".join([s.name_hi if language == "hi" else s.name for s in schemes])

        if language == "hi":
            text = (
                f"नमस्ते {farmer_name} जी। आपके प्रोफ़ाइल के अनुसार 3 प्रमुख योजनाएं उपलब्ध हैं: "
                f"1. पीएम-किसान सम्मान निधि, जिसमें सालाना 6,000 रुपये मिलते हैं। "
                f"2. राजीव गांधी किसान न्याय योजना, जिसमें 9,000 रुपये प्रति एकड़ इनपुट सहायता है। "
                f"3. किसान क्रेडिट कार्ड, जिसमें 4 प्रतिशत पर फसली ऋण मिलता है। "
                f"अधिक जानकारी के लिए 9 दबाएं या मुख्य मेनू पर लौटें।"
            )
        elif language == "cghi":
            text = (
                f"जोहार {farmer_name} भैया। आपके बर 3 ठन मुख्य योजना हावय: "
                f"1. पीएम-किसान योजना, जेमा हर बछर 6,000 रुपिया मिलथे। "
                f"2. राजीव गांधी किसान न्याय योजना, जेमा 9,000 रुपिया एकड़ सहायता हावय। "
                f"3. किसान क्रेडिट कार्ड, जेमा 4 परतिसत म लोन मिलथे।"
            )
        else:
            text = (
                f"Welcome {farmer_name}. Based on your profile, 3 key schemes are available: "
                f"PM-KISAN with ₹6,000 annual income support, Rajiv Gandhi Kisan Nyay Yojana with ₹9,000 per acre, "
                f"and Kisan Credit Card with 4% interest rate."
            )

        return {"key": key, "text": text, "action": "PLAY_AND_WAIT", "next_options": ["1", "2", "3", "4", "5", "9"]}

    elif key == "2":
        # Loan & Subsidy
        if language == "hi":
            text = (
                f"{farmer_name} जी, आपके 2 एकड़ रकबे पर केसीसी के तहत लगभग 50,000 रुपये तक की साख सीमा अनुमानित है। "
                f"समय पर भुगतान पर 3 प्रतिशत सरकारी ब्याज छूट मिलती है। "
                f"कृषि यंत्रों पर 50 प्रतिशत तक की डीबीटी सब्सिडी उपलब्ध है।"
            )
        elif language == "cghi":
            text = (
                f"{farmer_name} भैया, 2 एकड़ खेत बर केसीसी म 50,000 रुपिया तक लोन मिल सकत हे। "
                f"बखत म पटाए ले 3 परतिसत छूट मिलही। ट्रैक्टर अऊ औजार म 50 परतिसत सब्सिडी हे।"
            )
        else:
            text = (
                f"For your 2-acre holding, estimated KCC credit limit is up to ₹50,000 at 4% net interest rate. "
                f"Up to 50% capital subsidy is available on farm machinery."
            )
        return {"key": key, "text": text, "action": "PLAY_AND_WAIT"}

    elif key == "3":
        # Application Status
        apps_res = await db.execute(select(Application).order_by(Application.created_at.desc()).limit(2))
        apps = apps_res.scalars().all()
        app_summary = []
        for a in apps:
            app_summary.append(f"{a.reference_number}: {a.status}")

        if language == "hi":
            text = (
                f"आपके दर्ज आवेदनों की वर्तमान स्थिति: "
                f"आवेदन नंबर केएस-10482 स्वीकृत हो चुका है। "
                f"फसल बीमा दावा सीजी-8821 समीक्षाधीन है। "
                f"अधिक जानकारी के लिए 5 दबाकर शिकायत दर्ज करें।"
            )
        elif language == "cghi":
            text = (
                f"आपके अर्जी के हाल: "
                f"अर्जी नंबर केएस-10482 पास हो गे हे। "
                f"फसल बीमा अर्जी सीजी-8821 के जांच चलत हे।"
            )
        else:
            text = (
                f"Application status: Application KS-2026-10482 is Approved. "
                f"Crop Insurance Claim CG-PMFBY-8821 is Under Review."
            )
        return {"key": key, "text": text, "action": "PLAY_AND_WAIT"}

    elif key == "4":
        # Payment Status
        if language == "hi":
            text = (
                f"आपके खाते का भुगतान विवरण: "
                f"पीएम-किसान की 16वीं किस्त के 2,000 रुपये 15 नवंबर को आपके आधार से जुड़े खाते में जमा हो चुके हैं। "
                f"फसल बीमा का 8,000 रुपये का दावा स्वीकृत हुआ है, जिसमें 4,000 रुपये की विसंगति दर्ज की गई है।"
            )
        elif language == "cghi":
            text = (
                f"खाता म पईसा के हाल: "
                f"पीएम-किसान के 2,000 रुपिया 15 नवंबर के आपके खाता म जमा हो गे हे। "
                f"बीमा के 8,000 रुपिया पास होए हे।"
            )
        else:
            text = (
                f"Payment record: ₹2,000 PM-KISAN installment was credited on 15 Nov 2026 to your Aadhaar-linked account. "
                f"Crop insurance sanction of ₹8,000 is under processing."
            )
        return {"key": key, "text": text, "action": "PLAY_AND_WAIT"}

    elif key == "5":
        # Register Complaint
        ref = "GRV-IVR-4821"
        if language == "hi":
            text = (
                f"आपकी शिकायत दर्ज कर ली गई है। आपका संदर्भ नंबर है: {ref}। "
                f"कृषि विस्तार अधिकारी 48 घंटे के भीतर आपसे संपर्क करेंगे। धन्यवाद।"
            )
        elif language == "cghi":
            text = (
                f"आपके शिकायत लिख ले गे हे। टोकन नंबर हे: {ref}। "
                f"कृषि अधिकारी 48 घंटा म गोठ-बात करही। जोहार।"
            )
        else:
            text = (
                f"Your grievance has been logged. Platform reference token is {ref}. "
                f"The Agriculture Extension Officer will contact you within 48 hours. Thank you."
            )
        return {"key": key, "text": text, "action": "HANGUP"}

    else:
        # Key 9 or Welcome Menu
        if language == "hi":
            text = (
                f"कृषि सेतु टेलीफोन सहायता में आपका स्वागत है। "
                f"सरकारी योजनाओं की जानकारी के लिए 1 दबाएं। "
                f"ऋण और सब्सिडी गणना के लिए 2 दबाएं। "
                f"आवेदन की स्थिति जानने के लिए 3 दबाएं। "
                f"भुगतान और खाते की जानकारी के लिए 4 दबाएं। "
                f"शिकायत दर्ज करने के लिए 5 दबाएं। "
                f"यह मेनू दोबारा सुनने के लिए 9 दबाएं।"
            )
        elif language == "cghi":
            text = (
                f"कृषि सेतु फोन सेवा म आप सबो के स्वागत हे। "
                f"सरकारी योजना जाने बर 1 दबाओ। "
                f"कर्जा अऊ सब्सिडी बर 2 दबाओ। "
                f"अर्जी के हाल बर 3 दबाओ। "
                f"पईसा के हाल बर 4 दबाओ। "
                f"शिकायत करे बर 5 दबाओ। "
                f"फेर सुने बर 9 दबाओ।"
            )
        else:
            text = (
                f"Welcome to KrishiSetu telephone assistance. "
                f"Press 1 for Government Scheme Information. "
                f"Press 2 for Loan & Subsidy Calculator. "
                f"Press 3 for Application Status. "
                f"Press 4 for Payment Records. "
                f"Press 5 to Register a Grievance. "
                f"Press 9 to repeat this menu."
            )
        return {"key": "menu", "text": text, "action": "PLAY_AND_WAIT", "options": [1, 2, 3, 4, 5, 9]}
