import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const surveyResponsesTable = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  respondentName: text("respondent_name"),
  answers: integer("answers").array().notNull(),
  totalScore: real("total_score").notNull(),
  groupDiscussionScore: real("group_discussion_score").notNull(),
  meetingsScore: real("meetings_score").notNull(),
  interpersonalScore: real("interpersonal_score").notNull(),
  publicSpeakingScore: real("public_speaking_score").notNull(),
  apprehensionLevel: text("apprehension_level").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponsesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponsesTable.$inferSelect;
