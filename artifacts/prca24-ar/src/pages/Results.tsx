import React from "react";
import { Link, useParams } from "wouter";
import { submissionStore } from "@/lib/store";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, BarChart3 } from "lucide-react";

export default function Results() {
  const params = useParams();
  const submission = submissionStore.getLastSubmission();

  if (!submission || submission.id.toString() !== params.id) {
    return (
      <div className="min-h-screen py-12 px-4 flex flex-col items-center justify-center space-y-6 text-center">
        <h1 className="text-xl sm:text-2xl font-bold">النتيجة غير متوفرة</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-sm">
          تم تحديث الصفحة أو النتيجة غير موجودة. يرجى تقديم استبيان جديد.
        </p>
        <Link href="/">
          <Button size="lg" className="w-full sm:w-auto">
            <Home className="ml-2 w-5 h-5" /> العودة للاستبيان
          </Button>
        </Link>
      </div>
    );
  }

  const getInterpretationDetails = (level: string) => {
    switch (level) {
      case "low":
        return { label: "قلق تواصل منخفض", color: "text-green-600", bg: "bg-green-100", bar: "bg-green-600" };
      case "high":
        return { label: "قلق تواصل مرتفع", color: "text-red-600", bg: "bg-red-100", bar: "bg-red-600" };
      default:
        return { label: "قلق تواصل متوسط", color: "text-yellow-600", bg: "bg-yellow-100", bar: "bg-yellow-500" };
    }
  };

  const interp = getInterpretationDetails(submission.apprehensionLevel);

  const subscales = [
    { label: "المناقشات الجماعية", score: submission.groupDiscussionScore, max: 30 },
    { label: "الاجتماعات", score: submission.meetingsScore, max: 30 },
    { label: "المحادثات الشخصية", score: submission.interpersonalScore, max: 30 },
    { label: "الخطابة والتحدث أمام الجمهور", score: submission.publicSpeakingScore, max: 30 },
  ];

  return (
    <div className="min-h-screen py-8 px-3 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <Card className="border-t-4 border-t-primary shadow-xl overflow-hidden">
        <div className={`py-6 sm:py-8 text-center border-b ${interp.bg}`}>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-3 sm:mb-4">
            {submission.totalScore}{" "}
            <span className="text-xl sm:text-2xl font-medium text-muted-foreground">/ 120</span>
          </h1>
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-base sm:text-lg font-bold ${interp.color} bg-white shadow-sm`}>
            {interp.label}
          </div>
          {submission.respondentName && (
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg font-medium text-muted-foreground">
              النتيجة الخاصة بـ: {submission.respondentName}
            </p>
          )}
        </div>

        <CardContent className="pt-6 sm:pt-8 pb-8 sm:pb-10 space-y-6 sm:space-y-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">تحليل النتيجة</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              يعكس هذا المجموع درجاتك عبر أربعة مجالات مختلفة للتواصل.
            </p>
          </div>

          <div className="space-y-5 sm:space-y-6">
            {subscales.map((scale, i) => (
              <div key={i} className="space-y-2">
                <div className="flex flex-wrap justify-between items-end gap-1">
                  <span className="font-semibold text-sm sm:text-lg">{scale.label}</span>
                  <span className="text-muted-foreground font-medium text-sm sm:text-base shrink-0">
                    {scale.score} / {scale.max}
                  </span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${interp.bar}`}
                    style={{ width: `${(scale.score / scale.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30 p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              <Home className="ml-2 w-5 h-5" /> استبيان جديد
            </Button>
          </Link>
          <Link href="/stats" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              <BarChart3 className="ml-2 w-5 h-5" /> عرض الإحصائيات
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
