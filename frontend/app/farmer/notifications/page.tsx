"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, AlertTriangle, FileText, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { Card, PageHeading, VoiceAssistButton } from "@/components/ui-kit";
import { getNotifications, markNotificationRead } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/context";

export default function NotificationsPage() {
  const { t, language } = useTranslation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleMarkAsRead = async (id: number | string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.is_read) {
        await markNotificationRead(n.id);
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const audioSummary = `${language === "hi" ? "सूचनाएं एवं अलर्ट" : "Alerts and Notifications"}. ${language === "hi" ? "अपठित सूचनाएं" : "Unread alerts"}: ${unreadCount}.`;

  return (
    <div className="space-y-6">
      <PageHeading
        title={language === "hi" ? "सूचनाएं एवं नीति अलर्ट" : "Notifications & Policy Alerts"}
        description={
          language === "hi"
            ? "डीबीटी भुगतान पुष्टि, पात्रता सत्यापन अपडेट एवं नीति-विसंगति की तत्काल सूचनाएं।"
            : "Real-time updates regarding DBT payment transfers, audit alerts, and required document updates."
        }
        action={
          <div className="flex items-center gap-3">
            <VoiceAssistButton text={audioSummary} label={language === "hi" ? "सूचनाएं सुनें" : "Listen alerts"} />
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <Check className="size-3.5 text-emerald-600" />
                {language === "hi" ? "सभी को पढ़ा हुआ चिन्हित करें" : "Mark All Read"}
              </button>
            )}
          </div>
        }
      />

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="py-12 text-center text-slate-500">
            {language === "hi" ? "कोई नई सूचना नहीं है।" : "No notifications available."}
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 transition hover:shadow-md ${
                !n.is_read ? "border-l-4 border-l-[#166534] bg-emerald-50/20" : ""
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 rounded-xl p-2 ${
                      n.category === "Benefit Disbursal"
                        ? "bg-emerald-100 text-emerald-700"
                        : n.category === "Audit Alert"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {n.category === "Benefit Disbursal" ? (
                      <CheckCircle2 className="size-5" />
                    ) : n.category === "Audit Alert" ? (
                      <AlertTriangle className="size-5" />
                    ) : (
                      <Bell className="size-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {language === "hi" && n.title_hi ? n.title_hi : n.title}
                      </h4>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {n.category}
                      </span>
                      {!n.is_read && (
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {language === "hi" && n.message_hi ? n.message_hi : n.message}
                    </p>
                    <span className="mt-2 block text-[10px] text-slate-400">{n.created_at}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="rounded-lg p-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      title="Mark as read"
                    >
                      <Check className="size-4" />
                    </button>
                  )}
                  {n.action_url && (
                    <Link
                      href={n.action_url}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      {language === "hi" ? "देखें" : "View"}
                      <ArrowRight className="size-3" />
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
