ALTER TABLE "groups" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "words" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "words" ADD COLUMN "updated_by" uuid;