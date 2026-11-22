"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  IndianRupee,
  Landmark,
  MessageSquareWarning,
  ShieldCheck,
  Volume2,
  WalletCards,
  ArrowRight,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { BenefitJourneyVisualizer, JourneyStage } from "@/components/benefit-journey";
import { useTranslation } from "@/lib/i18n/context";
import { getBenefits } from "@/lib/api";

export default function BenefitDetailPage() {
  const params = useParams();
  const benefitId = (params?.benefitId as string) || "benefit-2";
  const { t, locale, speak } = useTranslation();
  const [benefit, setBenefit] = useState<any>(null);

  useEffect(() => {
    getBenefits().then((list) => {
      const matched = list.find((b) => b.id === benefitId);
      setBenefit(matched || list[0]);
    });
  }, [benefitId]);

  if (!benefit) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-400 font-semibold">{t("common.loading")}</p>
      </div>
    );
  }

  const isMismatch = benefit.sanctioned_amount > 0 && benefit.sanctioned_amount < benefit.estimated_amount;
  const variance = benefit.estimated_amount - benefit.sanctioned_amount;

  // Build the 8 stages for this specific benefit
  const stages: JourneyStage[] = [
    {
      id: "stage-1",
      name: "Potentially Eligible",
      name_hi: "संभावित पात्र",
      status: "completed",
      amount: benefit.estimated_amount,
      amountLabel: "Estimated Entitlement",
      amountLabel_hi: "अनुमानित पात्रता",
      attribution: "System-calculated",
      date: "10 Oct 2026",
      policyCitation: "PMFBY Operational Guidelines Para 4.1",
      explanation: "Farmer profile satisfied location, crop (Paddy), and notified insurance unit conditions.",
      explanation_hi: "किसान प्रोफ़ाइल ने स्थान, धान की फसल और अधिसूचित बीमा इकाई मानकों को पूर्ण किया।",
      recommendedAction: "Prepare required sowing certificate and land records.",
      recommendedAction_hi: "फसल बुवाई प्रमाण पत्र और भू-अभिलेख तैयार करें।",
    },
    {
      id: "stage-2",
      name: "Application Prepared",
      name_hi: "आवेदन तैयार",
      status: "completed",
      amountLabel: "Dossier Status",
      amountLabel_hi: "दस्तावेज़ स्थिति",
      attribution: "Farmer-reported",
      date: "04 Nov 2026",
      referenceNumber: "FORM-CG-PMFBY-2026",
      evidenceDocument: "Khasra B1 & Sowing Declaration",
      explanation: "Dossier assembled with verified Khasra 142/2 and crop sowing declaration.",
      explanation_hi: "खसरा 142/2 और फसल बुवाई स्व-घोषणा के साथ आवेदन तैयार किया गया।",
      recommendedAction: "Submit dossier to PACS Samiti or Lok Seva Kendra.",
      recommendedAction_hi: "आवेदन पैक्स समिति या लोक सेवा केंद्र में जमा करें।",
    },
    {
      id: "stage-3",
      name: "Submitted",
      name_hi: "आवेदन प्रस्तुत",
      status: "completed",
      amount: benefit.applied_amount,
      amountLabel: "Claim Amount Filed",
      amountLabel_hi: "दावा की गई राशि",
      attribution: "Officially verified",
      date: "08 Nov 2026",
      referenceNumber: "CG-PMFBY-8821",
      evidenceDocument: "PACS Acknowledgment Receipt",
      explanation: "Official application registered in National Crop Insurance Portal.",
      explanation_hi: "राष्ट्रीय फसल बीमा पोर्टल में आधिकारिक पावती दर्ज हुई।",
      recommendedAction: "Await joint crop damage field survey.",
      recommendedAction_hi: "संयुक्त फसल क्षति सर्वेक्षण की प्रतीक्षा करें।",
    },
    {
      id: "stage-4",
      name: "Field Verification",
      name_hi: "क्षेत्रीय सत्यापन",
      status: "completed",
      amountLabel: "Survey Finding",
      amountLabel_hi: "सर्वेक्षण रिपोर्ट",
      attribution: "Officer-reviewed",
      date: "14 Nov 2026",
      evidenceDocument: "Joint Survey Report & CCE Yield Sheet",
      explanation: "RAEO and Insurance Surveyor recorded 60% threshold yield loss in Khamtarai.",
      explanation_hi: "ग्रामीण कृषि विस्तार अधिकारी और बीमा सर्वेक्षक द्वारा 60% फसल क्षति प्रमाणित।",
      recommendedAction: "Survey report uploaded to claims clearinghouse.",
      recommendedAction_hi: "सर्वेक्षण रिपोर्ट दावा डेस्क को प्रेषित की गई।",
    },
    {
      id: "stage-5",
      name: "Approved",
      name_hi: "स्वीकृत",
      status: "completed",
      amount: benefit.approved_amount,
      amountLabel: "Desk Approved Amount",
      amountLabel_hi: "स्वीकृत राशि",
      attribution: "Officer-reviewed",
      date: "16 Nov 2026",
      referenceNumber: "APR-2026-9921",
      explanation: "District Agriculture Level Committee cleared claim entitlement of ₹12,000.",
      explanation_hi: "जिला कृषि समिति द्वारा ₹12,000 की पूर्ण पात्रता स्वीकृत की गई।",
      recommendedAction: "Transmitted to insurer for sanction order issuance.",
      recommendedAction_hi: "बीमा कंपनी को स्वीकृति आदेश जारी करने हेतु भेजा गया।",
    },
    {
      id: "stage-6",
      name: "Sanctioned",
      name_hi: "स्वीकृति आदेश जारी",
      status: isMismatch ? "discrepancy" : "completed",
      amount: benefit.sanctioned_amount,
      amountLabel: "Official Sanction Order",
      amountLabel_hi: "स्वीकृति आदेश राशि",
      attribution: "Officially verified",
      date: "18 Nov 2026",
      referenceNumber: "SANC-AIC-88412",
      evidenceDocument: "Sanction Letter No. AIC/CG/2026/88412",
      blocker: isMismatch
        ? `Sanction order issued for ₹${benefit.sanctioned_amount.toLocaleString()} instead of approved ₹${benefit.estimated_amount.toLocaleString()} (Discrepancy gap of ₹${variance.toLocaleString()}).`
        : undefined,
      explanation: isMismatch
        ? "Automated Policy-to-Payment Engine flagged a variance: Insurer sanction under-calculated the notified threshold loss by ₹4,000."
        : "Sanction order authorized for payment release.",
      explanation_hi: isMismatch
        ? "नीति-से-भुगतान सत्यनिष्ठा इंजन द्वारा ₹4,000 की कमी पाई गई। बीमा कंपनी ने स्वीकृत से कम राशि का आदेश जारी किया।"
        : "स्वीकृति आदेश अधिकृत किया गया।",
      recommendedAction: isMismatch ? "Raise official grievance for claim recalculation." : "Proceed to disbursement batch.",
      recommendedAction_hi: isMismatch ? "राशि सुधार हेतु आधिकारिक शिकायत दर्ज करें।" : "भुगतान बैच की प्रतीक्षा करें।",
    },
    {
      id: "stage-7",
      name: "Disbursed",
      name_hi: "भुगतान प्रेषित",
      status: benefit.disbursed_amount > 0 ? "completed" : "current",
      amount: benefit.disbursed_amount,
      amountLabel: "Treasury Disbursed",
      amountLabel_hi: "कोषालय द्वारा प्रेषित",
      attribution: "System-calculated",
      date: benefit.disbursed_amount > 0 ? "20 Nov 2026" : "Pending Treasury Batch",
      referenceNumber: "PFMS-CG-BATCH-4412",
      explanation: benefit.disbursed_amount > 0
        ? "Direct Benefit Transfer release batch generated on Public Financial Management System."
        : "Sanction order queued in PFMS payment file creation.",
      explanation_hi: benefit.disbursed_amount > 0
        ? "पीएफएमएस पोर्टल पर डीबीटी भुगतान बैच तैयार किया गया।"
        : "पीएफएमएस भुगतान बैच का सृजन लंबित है।",
      recommendedAction: "Monitor bank Aadhaar-NPCI credit.",
      recommendedAction_hi: "बैंक खाते में आधार डीबीटी क्रेडिट की निगरानी करें।",
    },
    {
      id: "stage-8",
      name: "Received Confirmed",
      name_hi: "बैंक खाते में प्राप्त",
      status: benefit.received_amount > 0 ? "completed" : "upcoming",
      amount: benefit.received_amount,
      amountLabel: "Bank Confirmed Received",
      amountLabel_hi: "बैंक खाते में जमा राशि",
      attribution: "Officially verified",
      date: benefit.received_amount > 0 ? "22 Nov 2026" : "Awaiting Bank Credit",
      referenceNumber: "UTR-SBIN-88941245",
      explanation: benefit.received_amount > 0
        ? "Confirmed credited into Aadhaar-seeded bank account."
        : "Awaiting final NPCI clearing and SMS confirmation.",
      explanation_hi: benefit.received_amount > 0
        ? "आधार से जुड़े बैंक खाते में राशि सफलतापूर्वक जमा हुई।"
        : "अंतिम बैंक क्लीयरिंग और एसएमएस पुष्टि प्रतीक्षित है।",
      recommendedAction: "Download tax/ledger receipt for tax and revenue records.",
      recommendedAction_hi: "राजस्व अभिलेख हेतु पावती रसीद डाउनलोड करें।",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button and status */}
      <div className="flex items-center justify-between">
        <Link
          href="/farmer/benefits"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="size-4" /> Back to My Benefits Ledger
        </Link>
        <StatusBadge status={benefit.status} />
      </div>

      <PageHeading
        title={benefit.scheme_name || benefit.scheme_id}
        description={`Benefit Ledger Record #${benefit.id} · Financial Year ${benefit.financial_year} · ${benefit.installment_info}`}
      />

      {/* Signature Feature: Interactive 8-Stage Benefit Journey */}
      <BenefitJourneyVisualizer
        schemeName={benefit.scheme_name}
        schemeCode={benefit.scheme_id.toUpperCase()}
        currentStageIndex={isMismatch ? 5 : 6}
        stages={stages}
      />

      {/* Discrepancy Alert & Grievance Actions */}
      {isMismatch && (
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-rose-900/15 to-transparent p-6 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <AlertTriangle className="size-5 text-rose-400" />
              <span>Policy Discrepancy Detected by Integrity Engine</span>
            </div>
            <span className="rounded bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-300 border border-rose-500/30">
              AUDIT ACTIVE
            </span>
          </div>

          <p className="text-xs text-rose-200/90 leading-relaxed max-w-3xl">
            Our Policy-to-Payment Integrity Engine identified a <b>₹{variance.toLocaleString()} variance gap</b> between the statutory policy entitlement formula (₹{benefit.estimated_amount.toLocaleString()}) and the issued sanction order (₹{benefit.sanctioned_amount.toLocaleString()}).
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={`/farmer/grievances/new?scheme=${benefit.scheme_id}&variance=${variance}`}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition"
            >
              <MessageSquareWarning className="size-4" />
              <span>File Official Grievance Ticket →</span>
            </Link>

            <Link
              href="/farmer/applications/app-2"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-slate-200 transition"
            >
              <FileText className="size-4" />
              <span>Inspect Application Dossier</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
