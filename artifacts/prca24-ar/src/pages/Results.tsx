import React, { useMemo } from "react";
import { Link, useParams } from "wouter";
import { submissionStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, BarChart3, Lightbulb, TrendingUp } from "lucide-react";
import { useGetScores } from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

export default function Results() {
  const params = useParams();
  const submission = submissionStore.getLastSubmission();
  const { data: scoresData } = useGetScores();

  const distributionData = useMemo(() => {
    if (!scoresData?.scores?.length) return [];
    const buckets = [
      { range: "24-35", min: 24, max: 35, count: 0 },
      { range: "36-45", min: 36, max: 45, count: 0 },
      { range: "46-55", min: 46, max: 55, count: 0 },
      { range: "56-65", min: 56, max: 65, count: 0 },
      { range: "66-75", min: 66, max: 75, count: 0 },
      { range: "76-85", min: 76, max: 85, count: 0 },
      { range: "86-95", min: 86, max: 95, count: 0 },
      { range: "96-120", min: 96, max: 120, count: 0 },
    ];
    for (const s of scoresData.scores) {
      const b = buckets.find((b) => s >= b.min && s <= b.max);
      if (b) b.count++;
    }
    return buckets;
  }, [scoresData]);

  const userBucket = useMemo(() => {
    if (!submission) return null;
    const s = submission.totalScore;
    if (s <= 35) return "24-35";
    if (s <= 45) return "36-45";
    if (s <= 55) return "46-55";
    if (s <= 65) return "56-65";
    if (s <= 75) return "66-75";
    if (s <= 85) return "76-85";
    if (s <= 95) return "86-95";
    return "96-120";
  }, [submission]);

  const percentileText = useMemo(() => {
    if (!scoresData?.scores?.length || !submission) return null;
    const below = scoresData.scores.filter((s) => s < submission.totalScore).length;
    const pct = Math.round((below / scoresData.scores.length) * 100);
    return pct;
  }, [scoresData, submission]);

  if (!submission || submission.id.toString() !== params.id) {
    return (
      <div className="min-h-screen py-12 px-4 flex flex-col items-center justify-center space-y-6">
        <h1 className="text-2xl font-bold">النتيجة غير متوفرة</h1>
        <p className="text-muted-foreground">تم تحديث الصفحة أو النتيجة غير موجودة. يرجى تقديم استبيان جديد.</p>
        <Link href="/">
          <Button size="lg"><Home className="ml-2 w-5 h-5" /> العودة للاستبيان</Button>
        </Link>
      </div>
    );
  }

  const getInterpretationDetails = (level: string) => {
    switch (level) {
      case "low":
        return { label: "قلق تواصل منخفض", color: "text-green-600", bg: "bg-green-100", bar: "bg-green-600", hex: "#16a34a" };
      case "high":
        return { label: "قلق تواصل مرتفع", color: "text-red-600", bg: "bg-red-100", bar: "bg-red-600", hex: "#dc2626" };
      default:
        return { label: "قلق تواصل متوسط", color: "text-yellow-600", bg: "bg-yellow-100", bar: "bg-yellow-500", hex: "#eab308" };
    }
  };

  const getTips = (level: string, sub: typeof submission) => {
    const highest = [
      { name: "المناقشات الجماعية", score: sub.groupDiscussionScore },
      { name: "الاجتماعات", score: sub.meetingsScore },
      { name: "المحادثات الشخصية", score: sub.interpersonalScore },
      { name: "الخطابة والتحدث أمام الجمهور", score: sub.publicSpeakingScore },
    ].sort((a, b) => b.score - a.score)[0];

    const specificTip: Record<string, string> = {
      "المناقشات الجماعية": "انضم إلى مجموعات نقاش صغيرة وتدرّب على التعبير عن رأيك بشكل منتظم.",
      "الاجتماعات": "حضّر نقطة واحدة على الأقل تودّ طرحها قبل كل اجتماع، وابدأ بالمساهمات القصيرة.",
      "المحادثات الشخصية": "مارس المحادثات اليومية البسيطة مع أشخاص جدد، وركّز على الاستماع الجيد أولاً.",
      "الخطابة والتحدث أمام الجمهور": "ابدأ بالتحدث أمام مجموعات صغيرة، وسجّل نفسك لمراجعة أدائك وتطويره.",
    };

    if (level === "low") {
      return {
        title: "أنت متواصل واثق!",
        summary: "درجتك تعكس مستوى منخفضاً من قلق التواصل، مما يدل على قدرتك الجيدة على التفاعل مع الآخرين.",
        tips: [
          "استثمر مهاراتك بمساعدة من حولك على تطوير تواصلهم.",
          "تولّ أدواراً قيادية تتطلب مهارات تواصل عالية.",
          `حافظ على تميّزك في مجال ${highest.name} واسعَ لتطوير بقية المجالات.`,
          "شارك في ورش الخطابة والإلقاء لصقل مهاراتك أكثر.",
          "استكشف فرص التدريب والتقديم أمام الجمهور.",
        ],
      };
    }

    if (level === "moderate") {
      return {
        title: "مستواك طبيعي ويمكن تحسينه",
        summary: `درجتك في النطاق المتوسط، وأعلى تحدٍّ لديك يظهر في مجال ${highest.name}.`,
        tips: [
          specificTip[highest.name],
          "تدرّب على التنفس العميق قبل المواقف التواصلية للتقليل من التوتر.",
          "ذكّر نفسك أن معظم الناس لا يلاحظون توترك بقدر ما تشعر به.",
          "ضع أهدافاً صغيرة قابلة للتحقيق في كل أسبوع لتوسيع نطاق تواصلك.",
          "تعلّم من النماذج الجيدة في التواصل وراقب أساليبهم.",
        ],
      };
    }

    return {
      title: "يمكنك تجاوز هذا التحدي",
      summary: `قلق التواصل أمر شائع جداً، وكثيرون تجاوزوه بالممارسة. أعلى تحدٍّ لديك في مجال ${highest.name}.`,
      tips: [
        specificTip[highest.name],
        "ابدأ بخطوات صغيرة جداً: تحدّث مع شخص واحد جديد يومياً.",
        "تعلّم تقنيات إدارة القلق مثل التنفس العميق والاسترخاء.",
        "فكّر في الانضمام إلى نادٍ للخطابة مثل Toastmasters أو مجموعة دعم.",
        "تذكّر: الممارسة المستمرة هي المفتاح، ومن الطبيعي أن تتحسّن تدريجياً.",
      ],
    };
  };

  const interp = getInterpretationDetails(submission.apprehensionLevel);
  const tips = getTips(submission.apprehensionLevel, submission);

  const subscales = [
    { label: "المناقشات الجماعية", score: submission.groupDiscussionScore, max: 30 },
    { label: "الاجتماعات", score: submission.meetingsScore, max: 30 },
    { label: "المحادثات الشخصية", score: submission.interpersonalScore, max: 30 },
    { label: "الخطابة والتحدث أمام الجمهور", score: submission.publicSpeakingScore, max: 30 },
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      const isUser = label === userBucket;
      return (
        <div className="bg-white border rounded-lg p-3 shadow-md text-sm font-medium" dir="rtl">
          <p className="text-muted-foreground">النطاق: {label}</p>
          <p className="text-foreground">عدد المستجيبين: {payload[0].value}</p>
          {isUser && <p className="text-primary font-bold mt-1">← درجتك هنا</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      <Card className="border-t-4 border-t-primary shadow-xl overflow-hidden">
        <div className={`py-8 text-center border-b ${interp.bg}`}>
          <h1 className="text-5xl font-black text-foreground mb-4">
            {submission.totalScore}{" "}
            <span className="text-2xl font-medium text-muted-foreground">/ 120</span>
          </h1>
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-lg font-bold ${interp.color} bg-white shadow-sm`}>
            {interp.label}
          </div>
          {submission.respondentName && (
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              النتيجة الخاصة بـ: {submission.respondentName}
            </p>
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
      </Card>

      {distributionData.length > 0 && (
        <Card className="shadow-xl border-t-4 border-t-blue-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">موقع درجتك بين المستجيبين</CardTitle>
                <CardDescription>
                  {percentileText !== null
                    ? `درجتك أعلى من ${percentileText}% من المستجيبين (من أصل ${scoresData?.total ?? 0} مشارك)`
                    : "توزيع درجات جميع المستجيبين"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="range" tick={{ fontSize: 12, fontFamily: "Tajawal" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fontFamily: "Tajawal" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  x={userBucket ?? undefined}
                  stroke={interp.hex}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  label={{ value: "درجتك", position: "top", fontSize: 12, fill: interp.hex, fontFamily: "Tajawal" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {distributionData.map((entry) => (
                    <Cell
                      key={entry.range}
                      fill={entry.range === userBucket ? interp.hex : "#cbd5e1"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-xl border-t-4 border-t-amber-500">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lightbulb className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{tips.title}</CardTitle>
              <CardDescription>{tips.summary}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {tips.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-foreground leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-6 flex flex-col sm:flex-row gap-4 justify-center">
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
        </CardContent>
      </Card>
    </div>
  );
}
