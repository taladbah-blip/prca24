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
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-12 w-64 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="min-h-screen py-12 px-4 flex flex-col items-center justify-center space-y-6">
        <h1 className="text-2xl font-bold text-destructive">حدث خطأ</h1>
        <p className="text-muted-foreground">تعذر تحميل الإحصائيات.</p>
        <Link href="/">
          <Button size="lg"><Home className="ml-2 w-5 h-5"/> العودة للرئيسية</Button>
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">إحصائيات المقياس</h1>
          <p className="text-muted-foreground mt-2">نظرة عامة على جميع الردود المسجلة.</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            <span>العودة للاستبيان</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <Users className="w-10 h-10" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">إجمالي المشاركات</p>
              <h2 className="text-4xl font-black">{stats.totalSubmissions}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <Activity className="w-10 h-10" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">متوسط الدرجة الكلية</p>
              <h2 className="text-4xl font-black">{Math.round(stats.averageTotalScore * 10) / 10} <span className="text-xl text-muted-foreground font-medium">/ 120</span></h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">توزيع مستويات القلق</CardTitle>
            <CardDescription>نسبة المشاركين في كل مستوى من مستويات قلق التواصل</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
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
              <div className="text-muted-foreground">لا توجد بيانات كافية لعرض الرسم البياني</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">متوسط الدرجات حسب المجال</CardTitle>
            <CardDescription>مقارنة بين متوسط درجات المشاركين في مجالات التواصل الأربعة (الحد الأقصى 30)</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontFamily: 'Tajawal' }} />
                <YAxis domain={[0, 30]} axisLine={false} tickLine={false} tick={{ fontFamily: 'Tajawal' }} orientation="right" />
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
