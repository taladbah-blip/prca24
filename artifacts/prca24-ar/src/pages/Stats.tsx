import React from "react";
import { Link } from "wouter";
import { useGetStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, Activity } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Stats() {
  const { data: stats, isLoading, isError } = useGetStats();

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
        <Skeleton className="h-10 w-48 mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="min-h-screen py-12 px-4 flex flex-col items-center justify-center space-y-6 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-destructive">حدث خطأ</h1>
        <p className="text-muted-foreground text-sm sm:text-base">تعذر تحميل الإحصائيات.</p>
        <Link href="/">
          <Button size="lg" className="w-full sm:w-auto">
            <Home className="ml-2 w-5 h-5" /> العودة للرئيسية
          </Button>
        </Link>
      </div>
    );
  }

  const pieData = [
    { name: "منخفض", value: stats.lowCount, color: "#16a34a" },
    { name: "متوسط", value: stats.moderateCount, color: "#eab308" },
    { name: "مرتفع", value: stats.highCount, color: "#dc2626" }
  ].filter(d => d.value > 0);

  const barData = [
    { name: "المناقشات", score: stats.averageGroupDiscussion },
    { name: "الاجتماعات", score: stats.averageMeetings },
    { name: "المحادثات", score: stats.averageInterpersonal },
    { name: "الخطابة", score: stats.averagePublicSpeaking }
  ];

  return (
    <div className="min-h-screen py-8 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 sm:space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">إحصائيات المقياس</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">نظرة عامة على جميع الردود المسجلة.</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Home className="w-4 h-4" />
            <span>العودة للاستبيان</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card className="shadow-md">
          <CardContent className="p-5 sm:p-8 flex items-center gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 bg-primary/10 rounded-full text-primary shrink-0">
              <Users className="w-7 h-7 sm:w-10 sm:h-10" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">إجمالي المشاركات</p>
              <h2 className="text-3xl sm:text-4xl font-black">{stats.totalSubmissions}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-5 sm:p-8 flex items-center gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 bg-primary/10 rounded-full text-primary shrink-0">
              <Activity className="w-7 h-7 sm:w-10 sm:h-10" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">متوسط الدرجة الكلية</p>
              <h2 className="text-3xl sm:text-4xl font-black">
                {Math.round(stats.averageTotalScore * 10) / 10}{" "}
                <span className="text-lg sm:text-xl text-muted-foreground font-medium">/ 120</span>
              </h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">توزيع مستويات القلق</CardTitle>
            <CardDescription className="text-xs sm:text-sm">نسبة المشاركين في كل مستوى من مستويات قلق التواصل</CardDescription>
          </CardHeader>
          <CardContent className="h-64 sm:h-80 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius="35%"
                    outerRadius="55%"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} مشارك`, "العدد"]}
                    contentStyle={{ fontFamily: 'Tajawal, sans-serif', textAlign: 'right', direction: 'rtl' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground text-sm text-center">لا توجد بيانات كافية لعرض الرسم البياني</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">متوسط الدرجات حسب المجال</CardTitle>
            <CardDescription className="text-xs sm:text-sm">مقارنة بين متوسط درجات المشاركين في مجالات التواصل الأربعة (الحد الأقصى 30)</CardDescription>
          </CardHeader>
          <CardContent className="h-64 sm:h-80 pr-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontFamily: 'Tajawal', fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 30]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontFamily: 'Tajawal', fontSize: 12 }}
                  orientation="right"
                  width={30}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  formatter={(value) => [Math.round(Number(value) * 10) / 10, "المتوسط"]}
                  contentStyle={{ fontFamily: 'Tajawal, sans-serif', textAlign: 'right', direction: 'rtl' }}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
