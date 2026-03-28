import { pgTable, pgSchema, index, foreignKey, uuid, text, timestamp, unique, boolean, uniqueIndex, jsonb, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const neonAuth = pgSchema("neon_auth");


export const invitationInNeonAuth = neonAuth.table("invitation", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid().notNull(),
	email: text().notNull(),
	role: text(),
	status: text().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	inviterId: uuid().notNull(),
}, (table) => [
	index("invitation_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("invitation_organizationId_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.organizationId],
		foreignColumns: [organizationInNeonAuth.id],
		name: "invitation_organizationId_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.inviterId],
		foreignColumns: [userInNeonAuth.id],
		name: "invitation_inviterId_fkey"
	}).onDelete("cascade"),
]);

export const userInNeonAuth = neonAuth.table("user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().notNull(),
	image: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	role: text(),
	banned: boolean(),
	banReason: text(),
	banExpires: timestamp({ withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("user_email_key").on(table.email),
]);

export const sessionInNeonAuth = neonAuth.table("session", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: uuid().notNull(),
	impersonatedBy: text(),
	activeOrganizationId: text(),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [userInNeonAuth.id],
		name: "session_userId_fkey"
	}).onDelete("cascade"),
	unique("session_token_key").on(table.token),
]);

export const organizationInNeonAuth = neonAuth.table("organization", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	logo: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	metadata: text(),
}, (table) => [
	uniqueIndex("organization_slug_uidx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("organization_slug_key").on(table.slug),
]);

export const accountInNeonAuth = neonAuth.table("account", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: uuid().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ withTimezone: true, mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ withTimezone: true, mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [userInNeonAuth.id],
		name: "account_userId_fkey"
	}).onDelete("cascade"),
]);

export const verificationInNeonAuth = neonAuth.table("verification", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const jwksInNeonAuth = neonAuth.table("jwks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	publicKey: text().notNull(),
	privateKey: text().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }),
});

export const memberInNeonAuth = neonAuth.table("member", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid().notNull(),
	userId: uuid().notNull(),
	role: text().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("member_organizationId_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("member_userId_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.organizationId],
		foreignColumns: [organizationInNeonAuth.id],
		name: "member_organizationId_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [userInNeonAuth.id],
		name: "member_userId_fkey"
	}).onDelete("cascade"),
]);

export const projectConfigInNeonAuth = neonAuth.table("project_config", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	endpointId: text("endpoint_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	trustedOrigins: jsonb("trusted_origins").notNull(),
	socialProviders: jsonb("social_providers").notNull(),
	emailProvider: jsonb("email_provider"),
	emailAndPassword: jsonb("email_and_password"),
	allowLocalhost: boolean("allow_localhost").notNull(),
	pluginConfigs: jsonb("plugin_configs"),
	webhookConfig: jsonb("webhook_config"),
}, (table) => [
	unique("project_config_endpoint_id_key").on(table.endpointId),
]);

export const todos = pgTable('todos', {
	id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
	text: text('text').notNull(),
	completed: boolean('completed').notNull().default(false),
	userId: uuid('user_id')
		.notNull()
		.references(() => userInNeonAuth.id),
	createdAt: timestamp('created_at').defaultNow(),
});

export type Todo = typeof todos.$inferSelect;

// --- Word Comparison App tables ---

/**
 * All supported European country codes.
 * Used as the `countryCode` value in the translations table.
 */
export const EUROPEAN_COUNTRY_CODES = [
	'GB', 'ES', 'RO', 'FR', 'DE', 'IT', 'PT', 'NL', 'PL', 'SE',
	'NO', 'DK', 'FI', 'CZ', 'SK', 'HU', 'HR', 'BG', 'GR', 'TR',
	'UA', 'RU', 'RS', 'IE', 'IS', 'AL', 'LT', 'LV', 'EE', 'SI',
	'BA', 'ME', 'MK', 'BY', 'MD', 'AT', 'BE', 'CH', 'LU', 'GE',
] as const;

export type EuropeanCountryCode = (typeof EUROPEAN_COUNTRY_CODES)[number];

/**
 * Groups / categories (e.g. "animals", "colors", "food").
 */
export const groups = pgTable('groups', {
	id: uuid('id').defaultRandom().primaryKey().notNull(),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	description: text('description'),
	createdBy: uuid('created_by'),
	updatedBy: uuid('updated_by'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique('groups_slug_key').on(table.slug),
]);

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

/**
 * Words belonging to a group (e.g. "dog", "bear" inside the "animals" group).
 * The `name` is the canonical English word used as a label.
 */
export const words = pgTable('words', {
	id: uuid('id').defaultRandom().primaryKey().notNull(),
	groupId: uuid('group_id')
		.notNull()
		.references(() => groups.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	createdBy: uuid('created_by'),
	updatedBy: uuid('updated_by'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index('words_group_id_idx').using('btree', table.groupId),
	unique('words_group_id_name_key').on(table.groupId, table.name),
]);

export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;

/**
 * Translations – one row per word + country code.
 * e.g. word "dog" → { countryCode: "ES", translation: "perro" }
 */
export const translations = pgTable('translations', {
	id: uuid('id').defaultRandom().primaryKey().notNull(),
	wordId: uuid('word_id')
		.notNull()
		.references(() => words.id, { onDelete: 'cascade' }),
	countryCode: text('country_code').notNull(),
	translation: text('translation').notNull(),
	color: text('color'),
	family: text('family'),
	language: text('language'),
	root: text('root'),
	createdBy: uuid('created_by'),
	updatedBy: uuid('updated_by'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index('translations_word_id_idx').using('btree', table.wordId),
	unique('translations_word_id_country_code_key').on(table.wordId, table.countryCode),
]);

export type Translation = typeof translations.$inferSelect;
export type NewTranslation = typeof translations.$inferInsert;