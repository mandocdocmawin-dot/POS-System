import { z } from 'zod';
const id = z.string().min(1), text = z.string(), date = z.iso.datetime({ local: true, offset: true }), day = z.iso.date(), cents = z.number().int().nonnegative();
export const calendarEventSchema = z.object({ id, title: id, type: z.enum(['meeting', 'task', 'reminder', 'delivery', 'other']), start: date, end: date, allDay: z.boolean(), location: text.optional(), description: text.optional(), color: text.optional(), branchId: text.optional(), attendeeStaffIds: z.array(id), reminderMinutes: z.number().nonnegative().optional(), recurrence: z.object({ freq: z.enum(['daily', 'weekly', 'monthly']), interval: z.number().int().min(1), until: day.optional() }).optional(), createdBy: id, createdAt: date, updatedAt: date });
export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export const calendarLayers = ['holidays', 'shifts', 'payroll', 'due_dates', 'coupons', 'transfers', 'leave'] as const;
export interface DerivedCalendarItem { id: string; layer: typeof calendarLayers[number]; title: string; start: string; end: string; allDay: boolean; link: string }
export const notificationTypes = ['low_stock', 'out_of_stock', 'due_balance', 'overdue_balance', 'held_orders', 'transfer_incoming', 'coupon_expiring', 'payroll_draft', 'staff_late', 'not_clocked_in', 'document_expiring', 'calendar_reminder', 'unread_chat', 'unread_email', 'backup_reminder', 'storage_warning'] as const;
export type NotificationType = typeof notificationTypes[number];
export interface Notification { key: string; type: NotificationType; severity: 'info' | 'warning' | 'critical'; title: string; body: string; link: string; createdAt: string; branchId?: string }
export const notificationStateSchema = z.object({ userId: id, key: id, readAt: date.optional(), dismissedAt: date.optional() });
export type NotificationState = z.infer<typeof notificationStateSchema>;
export const notificationPrefsSchema = z.object({ userId: id, types: z.record(z.enum(notificationTypes), z.boolean()), autoReply: z.boolean().default(true) });
export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>;
export const conversationSchema = z.object({ id, type: z.enum(['direct', 'group']), name: text.optional(), memberIds: z.array(id), createdBy: id, createdAt: date, lastMessageAt: date });
export type Conversation = z.infer<typeof conversationSchema>;
export const chatMessageSchema = z.object({ id, conversationId: id, senderId: id, text: text.max(2000), createdAt: date, editedAt: date.optional(), deletedAt: date.optional(), replyToId: id.optional(), readBy: z.record(id, date), isAutoReply: z.boolean().optional() });
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export const emailSchema = z.object({ id, ownerStaffId: id, folder: z.enum(['inbox', 'sent', 'drafts', 'trash']), from: text, to: z.array(text), cc: z.array(text).optional(), subject: text, body: text, createdAt: date, starred: z.boolean(), read: z.boolean(), relatedEntity: z.object({ type: id, id }).optional(), templateId: text.optional(), deliveryStatus: z.literal('demo_saved').optional(), previousFolder: z.enum(['inbox', 'sent', 'drafts']).optional() });
export type Email = z.infer<typeof emailSchema>;
export const emailTemplateSchema = z.object({ id, name: id, subject: text, body: text, category: id, isSystem: z.boolean(), updatedAt: date });
export type EmailTemplate = z.infer<typeof emailTemplateSchema>;
export const ticketReplySchema = z.object({ id, authorId: id, body: id, createdAt: date });
export type TicketReply = z.infer<typeof ticketReplySchema>;
export const ticketSchema = z.object({ id, ticketNo: id, subject: id, message: id, category: id, priority: z.enum(['low', 'normal', 'high']), status: z.enum(['active', 'closed', 'deleted']), tags: z.array(text), authorId: id, assigneeId: text.optional(), source: z.enum(['help', 'contact']), replies: z.array(ticketReplySchema), createdAt: date, updatedAt: date, closedAt: date.optional() });
export type Ticket = z.infer<typeof ticketSchema>;
export const faqSchema = z.object({ id, category: id, question: id, answer: id, order: z.number().int(), status: z.enum(['active', 'inactive']) });
export type Faq = z.infer<typeof faqSchema>;
export const planSchema = z.object({ id, name: id, priceMonthly: cents, priceYearly: cents, features: z.array(id), highlighted: z.boolean(), status: z.enum(['active', 'inactive']), order: z.number().int() });
export type Plan = z.infer<typeof planSchema>;
export const subscriptionSchema = z.object({ planId: id, billingCycle: z.enum(['monthly', 'yearly']), startedAt: date, nextBillingDate: day, paymentMethodLabel: id });
export type Subscription = z.infer<typeof subscriptionSchema>;
export const billingInvoiceSchema = z.object({ id, invoiceNo: id, planId: id, amount: cents, status: z.enum(['paid', 'void']), issuedAt: date });
export type BillingInvoice = z.infer<typeof billingInvoiceSchema>;
export const staffDocumentSchema = z.object({ id, staffId: id, name: id, category: z.enum(['contract', 'id', 'certificate', 'medical', 'other']), mime: id, size: cents, fileKey: id, expiresAt: day.optional(), uploadedBy: id, createdAt: date, fileMissing: z.boolean().optional() });
export type StaffDocument = z.infer<typeof staffDocumentSchema>;
export const noteSchema = z.object({ id, profileStaffId: id, authorId: id, title: id, body: text, color: id, pinned: z.boolean(), tags: z.array(text), visibility: z.enum(['private', 'managers']), createdAt: date, updatedAt: date });
export type Note = z.infer<typeof noteSchema>;
export const profileProjectSchema = z.object({id, ownerId:id, title:id, description:text, status:z.enum(['planned','in_progress','completed']), memberIds:z.array(id), createdAt:date});
export type ProfileProject = z.infer<typeof profileProjectSchema>;
export interface ErrorLogEntry { id: string; message: string; stack?: string; route: string; createdAt: string }
export interface DemoGuideState { startedAt: string; dismissed: boolean; collapsed: boolean }
export const phase8Schema = z.object({
  privacyChoices:z.record(id,z.enum(['accepted','declined'])).optional(),
  follows:z.record(id,z.array(id)).optional(), projects:z.array(profileProjectSchema).optional(),
  guide:z.object({startedAt:z.union([z.literal(''),date]),dismissed:z.boolean(),collapsed:z.boolean()}).default({startedAt:'',dismissed:false,collapsed:false}),
  errors:z.array(z.object({id,message:text,stack:text.optional(),route:text,createdAt:date})).max(50).default([]),
  meta:z.object({schemaVersion:z.number().int().nonnegative(),appVersion:id,installedAt:date,lastMigrationAt:date.optional(),lastBackupAt:date.optional()}).optional(),
  events: z.array(calendarEventSchema), layers: z.record(id, z.array(z.enum(calendarLayers))),
  notificationStates: z.array(notificationStateSchema), prefs: z.array(notificationPrefsSchema), conversations: z.array(conversationSchema), messages: z.array(chatMessageSchema), emails: z.array(emailSchema), templates: z.array(emailTemplateSchema), tickets: z.array(ticketSchema), ticketCounters: z.record(id, cents), faqs: z.array(faqSchema), plans: z.array(planSchema), subscription: subscriptionSchema.nullable(), invoices: z.array(billingInvoiceSchema), documents: z.array(staffDocumentSchema), notes: z.array(noteSchema), votes: z.record(id, cents), recentSearches: z.record(id, z.array(text).max(8)),
});
export type Phase8Data = z.infer<typeof phase8Schema>;
