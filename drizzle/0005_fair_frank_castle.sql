ALTER TABLE "neon_auth"."project_config" ADD COLUMN "plugin_configs" jsonb;--> statement-breakpoint
ALTER TABLE "neon_auth"."project_config" ADD COLUMN "webhook_config" jsonb;--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "family" text;--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "language" text;--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "root" text;