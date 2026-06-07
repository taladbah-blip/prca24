import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useSubmitResponse } from "@workspace/api-client-react";
import { submissionStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Youtube } from "lucide-react";

const QUESTIONS = [
  "لا أحب المشاركة في المناقشات الجماعية.",
  "بشكل عام، أشعر بالراحة عند المشاركة في المناقشات الجماعية.",
  "أشعر بالتوتر والقلق عند المشاركة في المناقشات الجماعية.",
  "أحب الانخراط في المناقشات الجماعية.",
  "الانخراط في نقاش جماعي مع أشخاص جدد يجعلني متوتراً وقلقاً.",
  "أشعر بالهدوء والارتياح عند المشاركة في المناقشات الجماعية.",
  "بشكل عام، أشعر بالتوتر عندما يتعين علي المشاركة في اجتماع.",
  "عادةً ما أشعر بالهدوء والارتياح أثناء المشاركة في الاجتماعات.",
  "أشعر بهدوء تام عند الطلب مني إبداء رأيي في اجتماع.",
  "أخشى التعبير عن رأيي في الاجتماعات.",
  "التواصل في الاجتماعات يجعلني أشعر بعدم الارتياح عادةً.",
  "أشعر بارتياح تام عند الإجابة على الأسئلة في الاجتماعات.",
  "عند التحدث مع شخص جديد، أشعر بتوتر شديد.",
  "لا أخشى التعبير عن رأيي في المحادثات.",
  "في العادة، أشعر بتوتر شديد في المحادثات.",
  "في العادة، أشعر بهدوء وارتياح تام في المحادثات.",
  "عند التحدث مع شخص جديد، أشعر بارتياح كبير وعدم قلق.",
  "أخشى التحدث بصوت عالٍ أو المبادرة بالكلام في المحادثات.",
  "بشكل عام، لا أشعر بالخوف من إلقاء خطاب.",
  "تشعر أجزاء من جسدي بالتوتر والتصلب أثناء إلقاء الخطاب.",
  "أشعر بالارتياح وعدم القلق عند إلقاء الخطاب.",
  "تصبح أفكاري مشوشة ومضطربة أثناء إلقاء الخطاب.",
  "أواجه فرصة إلقاء الخطاب بثقة.",
  "أثناء الخطاب، أصاب بتوتر شديد حتى أنسى معلومات وحقائق أعرفها جيداً."
];

const SECTIONS = [
  { title: "المناقشات الجماعية", start: 0, end: 6 },
  { title: "الاجتماعات", start: 6, end: 12 },
  { title: "المحادثات الشخصية", start: 12, end: 18 },
  { title: "الخطابة والتحدث أمام الجمهور", start: 18, end: 24 }
];

const OPTIONS = [
  { val: "1", label: "أوافق بشدة" },
  { val: "2", label: "أوافق" },
  { val: "3", label: "محايد" },
  { val: "4", label: "لا أوافق" },
  { val: "5", label: "لا أوافق بشدة" }
];

export default function Survey() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const submitMutation = useSubmitResponse();

  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<number[]>(Array(24).fill(0));

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = parseInt(value, 10);
    setAnswers(newAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (answers.some(a => a === 0)) {
      toast({
        title: "خطأ",
        description: "يرجى الإجابة على جميع الأسئلة قبل التقديم.",
        variant: "destructive"
      });
      return;
    }

    submitMutation.mutate({
      data: {
        respondentName: name.trim() || null,
        answers
      }
    }, {
      onSuccess: (res) => {
        submissionStore.setLastSubmission(res);
        setLocation(`/results/${res.id}`);
      },
      onError: () => {
        toast({
          title: "حدث خطأ",
          description: "تعذر إرسال الرد، يرجى المحاولة مرة أخرى.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen py-8 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary leading-snug">
          مقياس التقرير الشخصي لقلق التواصل (PRCA-24)
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">ترجمة: د. طالب العذبه</p>
        <div className="flex justify-center mt-2">
          <Link href="/stats" className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2 transition-colors text-sm sm:text-base">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>عرض الإحصائيات</span>
          </Link>
        </div>
      </div>

      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardHeader className="bg-muted/30 border-b pb-5">
          <CardTitle className="text-lg sm:text-xl">التعليمات</CardTitle>
          <CardDescription className="text-sm sm:text-base text-foreground leading-relaxed mt-2">
            يتكون هذا المقياس من 24 عبارة تتعلق بمشاعرك حول التواصل مع الآخرين. يُرجى تحديد درجة انطباق كل عبارة عليك باختيار الإجابة المناسبة من (1) أوافق بشدة إلى (5) لا أوافق بشدة.
          </CardDescription>
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
            <span className="font-bold">ملاحظة:</span> هذا المقياس لا يتضمن الحديث مع أشخاص تعرفهم أو لك بهم علاقة وطيدة (كالأصدقاء المقربين والأقارب).
          </div>
        </CardHeader>
        <CardContent className="pt-5 sm:pt-6">
          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
            <div className="space-y-3 bg-muted/20 p-4 sm:p-6 rounded-lg border">
              <Label htmlFor="name" className="text-base sm:text-lg font-medium">الاسم (اختياري)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك هنا..."
                className="w-full sm:max-w-md text-base"
              />
            </div>

            <div className="space-y-10 sm:space-y-12">
              {SECTIONS.map((section) => (
                <div key={section.title} className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-primary border-b pb-2">{section.title}</h2>
                  <div className="space-y-4 sm:space-y-6">
                    {QUESTIONS.slice(section.start, section.end).map((q, idx) => {
                      const absoluteIndex = section.start + idx;
                      const selected = answers[absoluteIndex];
                      return (
                        <div key={absoluteIndex} className="p-4 sm:p-5 rounded-xl border bg-card hover:border-primary/40 transition-colors shadow-sm">
                          <p className="text-base sm:text-lg font-medium mb-4 leading-relaxed">
                            {absoluteIndex + 1}. {q}
                          </p>
                          <RadioGroup
                            value={selected ? selected.toString() : ""}
                            onValueChange={(val) => handleAnswerChange(absoluteIndex, val)}
                            className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-4"
                          >
                            {OPTIONS.map(opt => (
                              <label
                                key={opt.val}
                                htmlFor={`q${absoluteIndex}-opt${opt.val}`}
                                className={`flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-3 sm:px-3 sm:py-2 transition-colors select-none
                                  ${selected?.toString() === opt.val
                                    ? "border-primary bg-primary/10 text-primary font-semibold"
                                    : "border-border hover:border-primary/40 hover:bg-muted/40"
                                  }`}
                              >
                                <RadioGroupItem
                                  value={opt.val}
                                  id={`q${absoluteIndex}-opt${opt.val}`}
                                  className="shrink-0"
                                />
                                <span className="text-sm sm:text-base leading-tight">{opt.label}</span>
                              </label>
                            ))}
                          </RadioGroup>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 sm:pt-6 border-t">
              <Button
                type="submit"
                size="lg"
                className="w-full text-base sm:text-lg h-12 sm:h-14 shadow-md"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? "جاري التقديم..." : "تقديم الإجابات"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <a
        href="https://www.youtube.com/@esma3channel"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="link-youtube-channel"
        className="block group"
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-4 sm:gap-5 shadow-sm hover:shadow-md transition-all hover:border-red-400">
          <div className="shrink-0 bg-red-600 text-white rounded-xl p-2.5 sm:p-3 group-hover:bg-red-700 transition-colors">
            <Youtube className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <p className="text-xs sm:text-sm text-red-500 font-medium">قناة اسمع على يوتيوب</p>
            <p className="text-sm sm:text-base font-bold text-foreground leading-snug">
              مملكة الخيزران — الحلقة الثالثة
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">د. طالب العذبه · youtube.com/@esma3channel</p>
          </div>
        </div>
      </a>
    </div>
  );
}
