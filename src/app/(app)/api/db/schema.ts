import { relations } from 'drizzle-orm'
import { boolean, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkId: varchar('clerkId').notNull(),
  active: boolean('active').default(true),
  email: varchar('email'),
  firstName: varchar('firstName'),
  lastName: varchar('lastName'),
  createdAt: timestamp('createdAt', {
    mode: 'date',
    withTimezone: false,
  }).notNull(),
  updatedAt: timestamp('updatedAt', {
    mode: 'date',
    withTimezone: false,
  }).notNull(),
})
export const userRelations = relations(users, ({ many }) => ({
  userPenas: many(penas),
}))
export type User = typeof users.$inferSelect

export const events = pgTable('events', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  payloadId: varchar('payloadId').notNull().unique(),
  createdAt: timestamp('createdAt', {
    mode: 'date',
    withTimezone: false,
  }).notNull(),
  updatedAt: timestamp('updatedAt', {
    mode: 'date',
    withTimezone: false,
  }).notNull(),
})
export const eventRelations = relations(events, ({ many }) => ({
  eventPenas: many(penas),
}))

export const penas = pgTable('penas', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  memberOneId: integer('memberOneId').references(() => users.id),
  memberTwoId: integer('memberTwoId').references(() => users.id),
  memberThreeId: integer('memberThreeId').references(() => users.id),
  memberFourId: integer('memberFourId').references(() => users.id),
  eventId: integer('eventId').references(() => events.id),
  createdAt: timestamp('createdAt', {
    mode: 'date',
    withTimezone: false,
  }).notNull(),
  updatedAt: timestamp('updatedAt', {
    mode: 'date',
    withTimezone: false,
  }).notNull(),
})

export const penaRelations = relations(penas, ({ one }) => ({
  penaMemberOne: one(users, {
    fields: [penas.memberOneId],
    references: [users.id],
  }),
  penaMemberTwo: one(users, {
    fields: [penas.memberTwoId],
    references: [users.id],
  }),
  penaMemberThree: one(users, {
    fields: [penas.memberThreeId],
    references: [users.id],
  }),
  penaMemberFour: one(users, {
    fields: [penas.memberFourId],
    references: [users.id],
  }),
  penaEvent: one(events, { fields: [penas.eventId], references: [events.id] }),
}))

export const messages = pgTable('messages', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  penaId: integer('penaId').references(() => penas.id),
  userId: integer('userId').references(() => users.id),
  message: text('message').notNull(),
  createdAt: timestamp('createdAt', {
    mode: 'date',
    withTimezone: false,
  }).notNull(),
})

export const messageRelations = relations(messages, ({ one }) => ({
  messagePena: one(penas, { fields: [messages.penaId], references: [penas.id] }),
  messageUser: one(users, { fields: [messages.userId], references: [users.id] }),
}))
export type Message = typeof messages.$inferSelect
