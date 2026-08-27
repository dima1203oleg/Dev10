import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

// Users table (linked to Firebase Auth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Company profiles
export const companyProfiles = pgTable('company_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  edrpou: text('edrpou').notNull(),
  legalAddress: text('legal_address'),
  directorName: text('director_name'),
  email: text('email'),
  phone: text('phone'),
  vaultData: jsonb('vault_data'), // Stores equipment, staff, contracts, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tenders
export const tenders = pgTable('tenders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  tenderNumber: text('tender_number').notNull(),
  title: text('title').notNull(),
  customer: text('customer'),
  budgetUah: integer('budget_uah'),
  status: text('status'),
  foulScore: integer('foul_score'),
  riskLevel: text('risk_level'),
  summary: text('summary'),
  detailedData: jsonb('detailed_data'), // Stores requirements, boqItems, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Complaints
export const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  tenderId: integer('tender_id').references(() => tenders.id).notNull(),
  content: text('content').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  companyProfiles: many(companyProfiles),
  tenders: many(tenders),
  complaints: many(complaints),
}));

export const companyProfilesRelations = relations(companyProfiles, ({ one }) => ({
  owner: one(users, {
    fields: [companyProfiles.userId],
    references: [users.id],
  }),
}));

export const tendersRelations = relations(tenders, ({ one, many }) => ({
  owner: one(users, {
    fields: [tenders.userId],
    references: [users.id],
  }),
  complaints: many(complaints),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  owner: one(users, {
    fields: [complaints.userId],
    references: [users.id],
  }),
  tender: one(tenders, {
    fields: [complaints.tenderId],
    references: [tenders.id],
  }),
}));
