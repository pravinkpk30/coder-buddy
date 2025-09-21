import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  status: text("status").notNull().default("pending"), // pending, planning, architecting, coding, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const generatedFiles = pgTable("generated_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  fileType: text("file_type").notNull(),
  size: integer("size").notNull(),
  nodeType: text("node_type").notNull(), // planner, architect, coder
  createdAt: timestamp("created_at").defaultNow(),
});

export const generationProgress = pgTable("generation_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  nodeType: text("node_type").notNull(), // planner, architect, coder
  status: text("status").notNull(), // pending, in_progress, completed, failed
  progress: integer("progress").notNull().default(0), // 0-100
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  prompt: true,
});

export const insertGeneratedFileSchema = createInsertSchema(generatedFiles).pick({
  projectId: true,
  filename: true,
  content: true,
  fileType: true,
  size: true,
  nodeType: true,
});

export const insertGenerationProgressSchema = createInsertSchema(generationProgress).pick({
  projectId: true,
  nodeType: true,
  status: true,
  progress: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertGeneratedFile = z.infer<typeof insertGeneratedFileSchema>;
export type GeneratedFile = typeof generatedFiles.$inferSelect;

export type InsertGenerationProgress = z.infer<typeof insertGenerationProgressSchema>;
export type GenerationProgress = typeof generationProgress.$inferSelect;
