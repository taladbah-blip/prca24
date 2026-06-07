import React from "react";
import { Link, useParams } from "wouter";
import { submissionStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Home, BarChart3 } from "lucide-react";

export default function Results() {
  const params = useParams();
  const submission = submissionStore.getLastSubmission();

  // If no submission is in store (page refreshed), show a fallback
  if (!submission || submission.id.toString() !== params.id) {
    return (
      <div className="min-h-screen py-12 px-4 flex flex-col items-center justify-center space-y-6">
        <h1 className="text-2xl font-bold">النتيجة غير متوفرة</h1>
        <p className="text-muted-foreground">تم تحديث الصفحة أو النتيجة غير موجودة. يرجى تقديم استبيان جديد.</p>
        <Link href="/">
          <Button size="lg"><Home className="ml-2 w-5 h-5"/> العودة للاستبيان</Button>
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      <Card className="border-t-4 border-t-primary shadow-xl overflow-hidden">
        <div className={`py-8 text-center border-b ${interp.bg}`}>
          <h1 className="text-5xl font-black text-foreground mb-4">{submission.totalScore} <span className="text-2xl font-medium text-muted-foreground">/ 120</span></h1>
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-lg font-bold ${interp.color} bg-white shadow-sm`}>
            {interp.label}
          </div>
          {submission.respondentName && (
            <p className="mt-4 text-lg font-medium text-muted-foreground">النتيجة الخاصة بـ: {submission.respondentName}</p>
          )}
        </div>
        
        <CardContent className="pt-8 pb-10 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">تحليل النتيجة</h2>
            <p className="text-muted-foreground">يعكس هذا المجموع درجاتك عبر أربعة مجالات مختلفة للتواصل.</p>
          </div>

          <div className="space-y-6">
            {subscales.map((scale, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-lg">{scale.label}</span>
                  <span className="text-muted-foreground font-medium">{scale.score} / {scale.max}</span>
                </div>
                {/* Custom progress bar to use specific color if needed, or default primary */}
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
        <CardFooter className="bg-muted/30 p-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Home className="ml-2 w-5 h-5" /> استبيان جديد
            </Button>
          </Link>
          <Link href="/stats">
            <Button size="lg" className="w-full sm:w-auto">
              <BarChart3 className="ml-2 w-5 h-5" /> عرض الإحصائيات
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
