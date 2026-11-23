import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, ShieldAlert, MessageSquare, Building2 } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";

interface GrievanceDetailData {
  id: string;
  referenceNumber: string;
  category: string;
  scheme: string;
  applicationRef: string;
  subject: string;
  description: string;
  status: string;
  submittedAt: string;
  contactMethod: string;
  officerRemarks?: string;
  timeline: Array<{ stage: string; date: string; completed: boolean }>;
}

const GRIEVANCES_MAP: Record<string, GrievanceDetailData> = {
  "grv-1": {
    id: "grv-1",
    referenceNumber: "GRV-CG-10482",
    category: "Incorrect subsidy amount",
    scheme: "PM-KISAN Samman Nidhi",
    applicationRef: "KS-2026-10482",
    subject: "Sanction amount differs from verified benefit estimate",
    description: "I am requesting review of a recorded sanction amount that differs from the benefit estimate for my PM-KISAN application. The digital twin ledger flagged a discrepancy between expected credit and treasury disbursement order.",
    status: "Under review",
    submittedAt: "20 Nov 2026",
    contactMethod: "Mobile call (+91 98765 43210)",
    officerRemarks: "Case forwarded to District Agriculture Officer and Treasury for PFMS mandate audit. Cross-verifying Khasra account number.",
    timeline: [
      { stage: "Complaint lodged by farmer", date: "20 Nov 2026", completed: true },
      { stage: "Assigned to District Grievance Officer", date: "21 Nov 2026", completed: true },
      { stage: "Discrepancy audit in progress", date: "22 Nov 2026", completed: true },
      { stage: "Redressal & resolution order", date: "Target: 26 Nov 2026", completed: false },
    ],
  },
  "grv-2": {
    id: "grv-2",
    referenceNumber: "GRV-CG-10445",
    category: "Payment not received",
    scheme: "PM Fasal Bima Yojana",
    applicationRef: "CG-PMFBY-8821",
    subject: "Claim compensation approved but not credited to bank account",
    description: "Crop insurance claim of ₹12,000 approved on 08 Nov, but funds have not reached my SBI account. Seeking prompt disbursement update.",
    status: "Submitted",
    submittedAt: "14 Nov 2026",
    contactMethod: "SMS notification",
    officerRemarks: "Claim batch file scheduled with state SLBC bank nodal office.",
    timeline: [
      { stage: "Complaint lodged", date: "14 Nov 2026", completed: true },
      { stage: "Scrutiny by Insurance Nodal Officer", date: "In progress", completed: false },
      { stage: "Disbursement release", date: "Pending", completed: false },
    ],
  },
};

export default async function GrievanceDetailPage({
  params,
}: {
  params: Promise<{ grievanceId: string }>;
}) {
  const { grievanceId } = await params;
  const grievance = GRIEVANCES_MAP[grievanceId] || {
    id: grievanceId,
    referenceNumber: grievanceId.toUpperCase(),
    category: "Grievance Enquiry",
    scheme: "Agricultural Scheme",
    applicationRef: "KS-REF-DEMO",
    subject: "Benefit Discrepancy Inquiry",
    description: "Farmer grievance logged regarding entitlement processing, sanction verification, or bank transfer reconciliation.",
    status: "Under review",
    submittedAt: "November 2026",
    contactMethod: "Platform alert",
    timeline: [
      { stage: "Complaint registered", date: "Recently", completed: true },
      { stage: "Investigation by officer", date: "In progress", completed: false },
      { stage: "Dispute resolution", date: "Pending", completed: false },
    ],
  };

  return (
    <div className="space-y-6">
      <Link
        href="/farmer/grievances"
        className="glass glass-btn inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        <ArrowLeft className="size-3.5" />
        Back to Grievances
      </Link>

      <PageHeading
        title={`Grievance ${grievance.referenceNumber}`}
        description={`${grievance.category} · ${grievance.scheme}`}
        action={<StatusBadge status={grievance.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left Column: Complaint Details & Timeline */}
        <div className="space-y-6">
          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Grievance Description</h3>
            <p className="mt-1 text-xs font-medium text-emerald-800 dark:text-emerald-300">
              Subject: {grievance.subject}
            </p>
            <p className="mt-3 text-xs leading-6 text-slate-600 dark:text-slate-300">
              {grievance.description}
            </p>

            {grievance.officerRemarks && (
              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <Building2 className="size-4 text-emerald-600" />
                  <span>Official Scrutiny Note</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-emerald-800 dark:text-emerald-300">
                  {grievance.officerRemarks}
                </p>
              </div>
            )}
          </Card>

          <Card className="glass">
            <h3 className="font-bold text-slate-900 dark:text-white">Resolution Timeline</h3>
            <div className="mt-5 space-y-4">
              {grievance.timeline.map((item) => (
                <div key={item.stage} className="flex items-start gap-3">
                  <div className="mt-0.5 grid size-6 place-items-center rounded-full text-xs font-bold shrink-0">
                    {item.completed ? (
                      <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="size-5 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${item.completed ? "text-slate-900 dark:text-white" : "text-amber-700 dark:text-amber-400"}`}>
                      {item.stage}
                    </p>
                    <p className="text-xs text-slate-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Meta & Help */}
        <div className="space-y-5">
          <Card className="glass space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Case Metadata
            </h4>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-400">Application Ref</dt>
                <dd className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {grievance.applicationRef}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Lodged Date</dt>
                <dd className="font-semibold text-slate-700 dark:text-slate-200">
                  {grievance.submittedAt}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Contact Method</dt>
                <dd className="font-semibold text-slate-700 dark:text-slate-200">
                  {grievance.contactMethod}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="glass">
            <div className="flex items-start gap-3">
              <MessageSquare className="size-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Need Immediate Help?
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Call the Kisan Call Center toll-free helpline at <strong>1800-180-1551</strong> with your grievance ID {grievance.referenceNumber}.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
