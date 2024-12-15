CREATE TABLE IF NOT EXISTS "events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"createdAt" integer,
	"updatedAt" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "penas" (
	"id" varchar PRIMARY KEY NOT NULL,
	"memberOneId" integer,
	"memberTwoId" integer,
	"memberThreeId" integer,
	"memberFourId" integer,
	"eventId" integer,
	"createdAt" integer,
	"updatedAt" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"active" boolean DEFAULT true,
	"email" varchar,
	"firstName" varchar,
	"lastName" varchar,
	"createdAt" time,
	"updatedAt" time
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "penas" ADD CONSTRAINT "penas_memberOneId_users_id_fk" FOREIGN KEY ("memberOneId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "penas" ADD CONSTRAINT "penas_memberTwoId_users_id_fk" FOREIGN KEY ("memberTwoId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "penas" ADD CONSTRAINT "penas_memberThreeId_users_id_fk" FOREIGN KEY ("memberThreeId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "penas" ADD CONSTRAINT "penas_memberFourId_users_id_fk" FOREIGN KEY ("memberFourId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "penas" ADD CONSTRAINT "penas_eventId_events_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
