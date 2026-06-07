import { Router, type IRouter } from "express";
import { db, surveyResponsesTable } from "@workspace/db";
import { avg, count, sql } from "drizzle-orm";
import { SubmitResponseBody } from "@workspace/api-zod";

const router: IRouter = Router();

function computeScores(answers: number[]) {
  const q = answers; // 0-indexed: q[0] = Q1, q[23] = Q24

  const groupDiscussion = 18 + (q[1] + q[3] + q[5]) - (q[0] + q[2] + q[4]);
  const meetings = 18 + (q[7] + q[8] + q[11]) - (q[6] + q[9] + q[10]);
  const interpersonal = 18 + (q[13] + q[15] + q[16]) - (q[12] + q[14] + q[17]);
  const publicSpeaking = 18 + (q[18] + q[20] + q[22]) - (q[19] + q[21] + q[23]);
  const total = groupDiscussion + meetings + interpersonal + publicSpeaking;

  let apprehensionLevel: string;
  if (total < 51) {
    apprehensionLevel = "low";
  } else if (total <= 80) {
    apprehensionLevel = "moderate";
  } else {
    apprehensionLevel = "high";
  }

  return { groupDiscussion, meetings, interpersonal, publicSpeaking, total, apprehensionLevel };
}

router.post("/responses", async (req, res): Promise<void> => {
  const parsed = SubmitResponseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { answers, respondentName } = parsed.data;
  const scores = computeScores(answers);

  try {
    const [row] = await db
      .insert(surveyResponsesTable)
      .values({
        respondentName: respondentName ?? null,
        answers,
        totalScore: scores.total,
        groupDiscussionScore: scores.groupDiscussion,
        meetingsScore: scores.meetings,
        interpersonalScore: scores.interpersonal,
        publicSpeakingScore: scores.publicSpeaking,
        apprehensionLevel: scores.apprehensionLevel,
      })
      .returning();

    res.status(201).json({
      id: row.id,
      respondentName: row.respondentName,
      answers: row.answers,
      totalScore: row.totalScore,
      groupDiscussionScore: row.groupDiscussionScore,
      meetingsScore: row.meetingsScore,
      interpersonalScore: row.interpersonalScore,
      publicSpeakingScore: row.publicSpeakingScore,
      apprehensionLevel: row.apprehensionLevel,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save survey response");
    res.status(503).json({ error: "تعذّر حفظ الإجابات، يرجى المحاولة مرة أخرى." });
  }
});

router.get("/responses", async (req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(surveyResponsesTable)
      .orderBy(sql`${surveyResponsesTable.createdAt} desc`);

    res.json(
      rows.map((r) => ({
        id: r.id,
        respondentName: r.respondentName,
        answers: r.answers,
        totalScore: r.totalScore,
        groupDiscussionScore: r.groupDiscussionScore,
        meetingsScore: r.meetingsScore,
        interpersonalScore: r.interpersonalScore,
        publicSpeakingScore: r.publicSpeakingScore,
        apprehensionLevel: r.apprehensionLevel,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to fetch responses");
    res.status(503).json({ error: "تعذّر جلب البيانات، يرجى المحاولة مرة أخرى." });
  }
});

router.get("/responses/stats", async (req, res): Promise<void> => {
  try {
    const [totals] = await db
      .select({
        totalSubmissions: count(),
        averageTotalScore: avg(surveyResponsesTable.totalScore),
        averageGroupDiscussion: avg(surveyResponsesTable.groupDiscussionScore),
        averageMeetings: avg(surveyResponsesTable.meetingsScore),
        averageInterpersonal: avg(surveyResponsesTable.interpersonalScore),
        averagePublicSpeaking: avg(surveyResponsesTable.publicSpeakingScore),
      })
      .from(surveyResponsesTable);

    const levelCounts = await db
      .select({
        apprehensionLevel: surveyResponsesTable.apprehensionLevel,
        cnt: count(),
      })
      .from(surveyResponsesTable)
      .groupBy(surveyResponsesTable.apprehensionLevel);

    const lowCount = levelCounts.find((r) => r.apprehensionLevel === "low")?.cnt ?? 0;
    const moderateCount = levelCounts.find((r) => r.apprehensionLevel === "moderate")?.cnt ?? 0;
    const highCount = levelCounts.find((r) => r.apprehensionLevel === "high")?.cnt ?? 0;

    res.json({
      totalSubmissions: totals.totalSubmissions,
      averageTotalScore: parseFloat(totals.averageTotalScore ?? "0"),
      averageGroupDiscussion: parseFloat(totals.averageGroupDiscussion ?? "0"),
      averageMeetings: parseFloat(totals.averageMeetings ?? "0"),
      averageInterpersonal: parseFloat(totals.averageInterpersonal ?? "0"),
      averagePublicSpeaking: parseFloat(totals.averagePublicSpeaking ?? "0"),
      lowCount,
      moderateCount,
      highCount,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch stats");
    res.status(503).json({ error: "تعذّر جلب الإحصائيات، يرجى المحاولة مرة أخرى." });
  }
});

export default router;
