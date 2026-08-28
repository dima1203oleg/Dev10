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
  budgetUah: text('budget_uah'), // Stored as text to handle large numbers safely or use bigint
  status: text('status'),
  foulScore: integer('foul_score'),
  riskLevel: text('risk_level'),
  summary: text('summary'),
  detailedData: jsonb('detailed_data'), // Stores requirements, boqItems, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tender documents
export const tenderDocuments = pgTable('tender_documents', {
  id: text('id').primaryKey(),
  tenderId: integer('tender_id').references(() => tenders.id), // Made nullable
  name: text('name').notNull(),
  type: text('type').notNull(), // 'TECHNICAL', 'BOQ', 'LEGAL', 'OTHER'
  status: text('status').notNull(), // 'IDLE', 'PROCESSING', 'EXTRACTED', 'ERROR'
  size: integer('size'),
  storageKey: text('storage_key'), // Key for real S3/Local storage
  contentHash: text('content_hash'), // SHA-256 for integrity
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  extractedData: jsonb('extracted_data'),
  mimeType: text('mime_type'),
  userId: integer('user_id').references(() => users.id),
  orgId: integer('org_id').references(() => organizations.id),
});

// Organizations for multi-tenancy
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  edrpou: text('edrpou'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Team members linked to users and organizations
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  displayName: text('display_name'),
  email: text('email'),
  role: text('role').notNull().default('MEMBER'), // 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'
  roleNameUk: text('role_name_uk'),
  avatar: text('avatar'),
  status: text('status').notNull().default('OFFLINE'), // 'ONLINE', 'AWAY', 'OFFLINE'
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Team tasks (War Room)
export const teamTasks = pgTable('team_tasks', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  tenderId: integer('tender_id').references(() => tenders.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('TODO'), // 'TODO', 'IN_PROGRESS', 'DONE'
  priority: text('priority').notNull().default('MEDIUM'),
  assigneeId: integer('assignee_id').references(() => teamMembers.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Team comments
export const teamComments = pgTable('team_comments', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  taskId: integer('task_id').references(() => teamTasks.id),
  authorId: integer('author_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  orgId: integer('org_id').references(() => organizations.id),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations update
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(teamMembers),
  tasks: many(teamTasks),
  auditLogs: many(auditLogs),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
  organization: one(organizations, { fields: [teamMembers.orgId], references: [organizations.id] }),
}));

export const teamTasksRelations = relations(teamTasks, ({ one }) => ({
  organization: one(organizations, { fields: [teamTasks.orgId], references: [organizations.id] }),
  tender: one(tenders, { fields: [teamTasks.tenderId], references: [tenders.id] }),
  assignee: one(teamMembers, { fields: [teamTasks.assigneeId], references: [teamMembers.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
  organization: one(organizations, { fields: [auditLogs.orgId], references: [organizations.id] }),
}));

export const teamCommentsRelations = relations(teamComments, ({ one }) => ({
  organization: one(organizations, { fields: [teamComments.orgId], references: [organizations.id] }),
  author: one(users, { fields: [teamComments.authorId], references: [users.id] }),
  task: one(teamTasks, { fields: [teamComments.taskId], references: [teamTasks.id] }),
}));

// Favorites for tenders
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  tenderId: integer('tender_id').references(() => tenders.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  tender: one(tenders, { fields: [favorites.tenderId], references: [tenders.id] }),
}));

// Complaints
export const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  tenderId: integer('tender_id').references(() => tenders.id).notNull(),
  content: text('content').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Search sessions
export const searchSessions = pgTable('search_sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  rawQuery: text('raw_query').notNull(),
  structuredQuery: jsonb('structured_query').notNull(),
  source: text('source').default('Prozorro'),
  sourceCursor: text('source_cursor'),
  pagesScanned: integer('pages_scanned').default(0),
  recordsScanned: integer('records_scanned').default(0),
  recordsMatched: integer('records_matched').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  status: text('status').default('active'),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  companyProfiles: many(companyProfiles),
  tenders: many(tenders),
  complaints: many(complaints),
  searchSessions: many(searchSessions),
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
  documents: many(tenderDocuments),
}));

export const tenderDocumentsRelations = relations(tenderDocuments, ({ one }) => ({
  tender: one(tenders, {
    fields: [tenderDocuments.tenderId],
    references: [tenders.id],
  }),
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

export const searchSessionsRelations = relations(searchSessions, ({ one }) => ({
  owner: one(users, {
    fields: [searchSessions.userId],
    references: [users.id],
  }),
}));
