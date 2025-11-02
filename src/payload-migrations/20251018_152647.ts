import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_providers_availability_windows_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_services_pricing_currency" AS ENUM('USD', 'EUR', 'GBP', 'CAD', 'AUD');
  CREATE TYPE "public"."enum_appointments_reminders_channel" AS ENUM('email', 'sms', 'push');
  CREATE TYPE "public"."enum_appointments_reminders_status" AS ENUM('scheduled', 'sent', 'failed');
  CREATE TYPE "public"."enum_appointments_status" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
  CREATE TYPE "public"."enum_appointments_pricing_snapshot_currency" AS ENUM('USD', 'EUR', 'GBP', 'CAD', 'AUD');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "providers_specialties" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "providers_availability_windows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_providers_availability_windows_day" NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL
  );
  
  CREATE TABLE "providers_meta_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" varchar NOT NULL
  );
  
  CREATE TABLE "providers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"account_id" integer NOT NULL,
  	"display_name" varchar NOT NULL,
  	"slug" varchar,
  	"headline" varchar,
  	"bio" jsonb,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"contact_website" varchar,
  	"location_address" varchar,
  	"location_city" varchar,
  	"location_region" varchar,
  	"location_postal_code" varchar,
  	"location_country" varchar,
  	"location_time_zone" varchar DEFAULT 'UTC' NOT NULL,
  	"availability_default_duration_minutes" numeric,
  	"profile_image_id" integer,
  	"meta_rating" numeric,
  	"meta_review_count" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "providers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"category" varchar,
  	"description" jsonb,
  	"duration_minutes" numeric NOT NULL,
  	"buffer_minutes_before" numeric DEFAULT 0,
  	"buffer_minutes_after" numeric DEFAULT 0,
  	"pricing_amount" numeric NOT NULL,
  	"pricing_currency" "enum_services_pricing_currency" DEFAULT 'USD' NOT NULL,
  	"pricing_tax_rate" numeric,
  	"is_active" boolean DEFAULT true,
  	"lead_time_hours" numeric,
  	"instructions" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"providers_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "appointments_reminders" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sent_at" timestamp(3) with time zone,
  	"channel" "enum_appointments_reminders_channel",
  	"status" "enum_appointments_reminders_status"
  );
  
  CREATE TABLE "appointments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar,
  	"client_id" integer NOT NULL,
  	"provider_id" integer NOT NULL,
  	"service_id" integer NOT NULL,
  	"status" "enum_appointments_status" DEFAULT 'pending' NOT NULL,
  	"schedule_start" timestamp(3) with time zone NOT NULL,
  	"schedule_end" timestamp(3) with time zone NOT NULL,
  	"schedule_time_zone" varchar DEFAULT 'UTC' NOT NULL,
  	"schedule_location" varchar,
  	"schedule_buffer_before" numeric DEFAULT 0,
  	"schedule_buffer_after" numeric DEFAULT 0,
  	"schedule_duration_minutes" numeric,
  	"pricing_snapshot_amount" numeric NOT NULL,
  	"pricing_snapshot_currency" "enum_appointments_pricing_snapshot_currency" NOT NULL,
  	"pricing_snapshot_duration_minutes" numeric NOT NULL,
  	"pricing_snapshot_tax_rate" numeric,
  	"client_notes" varchar,
  	"internal_notes" varchar,
  	"cancellation_cancelled_at" timestamp(3) with time zone,
  	"cancellation_reason" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"providers_id" integer,
  	"services_id" integer,
  	"appointments_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "providers_specialties" ADD CONSTRAINT "providers_specialties_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "providers_availability_windows" ADD CONSTRAINT "providers_availability_windows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "providers_meta_languages" ADD CONSTRAINT "providers_meta_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "providers" ADD CONSTRAINT "providers_account_id_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "providers" ADD CONSTRAINT "providers_profile_image_id_media_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "providers_rels" ADD CONSTRAINT "providers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "providers_rels" ADD CONSTRAINT "providers_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_providers_fk" FOREIGN KEY ("providers_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appointments_reminders" ADD CONSTRAINT "appointments_reminders_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_providers_fk" FOREIGN KEY ("providers_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_appointments_fk" FOREIGN KEY ("appointments_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "providers_specialties_order_idx" ON "providers_specialties" USING btree ("_order");
  CREATE INDEX "providers_specialties_parent_id_idx" ON "providers_specialties" USING btree ("_parent_id");
  CREATE INDEX "providers_availability_windows_order_idx" ON "providers_availability_windows" USING btree ("_order");
  CREATE INDEX "providers_availability_windows_parent_id_idx" ON "providers_availability_windows" USING btree ("_parent_id");
  CREATE INDEX "providers_meta_languages_order_idx" ON "providers_meta_languages" USING btree ("_order");
  CREATE INDEX "providers_meta_languages_parent_id_idx" ON "providers_meta_languages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "providers_account_idx" ON "providers" USING btree ("account_id");
  CREATE UNIQUE INDEX "providers_slug_idx" ON "providers" USING btree ("slug");
  CREATE INDEX "providers_profile_image_idx" ON "providers" USING btree ("profile_image_id");
  CREATE INDEX "providers_updated_at_idx" ON "providers" USING btree ("updated_at");
  CREATE INDEX "providers_created_at_idx" ON "providers" USING btree ("created_at");
  CREATE INDEX "providers_rels_order_idx" ON "providers_rels" USING btree ("order");
  CREATE INDEX "providers_rels_parent_idx" ON "providers_rels" USING btree ("parent_id");
  CREATE INDEX "providers_rels_path_idx" ON "providers_rels" USING btree ("path");
  CREATE INDEX "providers_rels_services_id_idx" ON "providers_rels" USING btree ("services_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_providers_id_idx" ON "services_rels" USING btree ("providers_id");
  CREATE INDEX "services_rels_media_id_idx" ON "services_rels" USING btree ("media_id");
  CREATE INDEX "appointments_reminders_order_idx" ON "appointments_reminders" USING btree ("_order");
  CREATE INDEX "appointments_reminders_parent_id_idx" ON "appointments_reminders" USING btree ("_parent_id");
  CREATE INDEX "appointments_client_idx" ON "appointments" USING btree ("client_id");
  CREATE INDEX "appointments_provider_idx" ON "appointments" USING btree ("provider_id");
  CREATE INDEX "appointments_service_idx" ON "appointments" USING btree ("service_id");
  CREATE INDEX "appointments_updated_at_idx" ON "appointments" USING btree ("updated_at");
  CREATE INDEX "appointments_created_at_idx" ON "appointments" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_providers_id_idx" ON "payload_locked_documents_rels" USING btree ("providers_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_appointments_id_idx" ON "payload_locked_documents_rels" USING btree ("appointments_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "providers_specialties" CASCADE;
  DROP TABLE "providers_availability_windows" CASCADE;
  DROP TABLE "providers_meta_languages" CASCADE;
  DROP TABLE "providers" CASCADE;
  DROP TABLE "providers_rels" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "appointments_reminders" CASCADE;
  DROP TABLE "appointments" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_providers_availability_windows_day";
  DROP TYPE "public"."enum_services_pricing_currency";
  DROP TYPE "public"."enum_appointments_reminders_channel";
  DROP TYPE "public"."enum_appointments_reminders_status";
  DROP TYPE "public"."enum_appointments_status";
  DROP TYPE "public"."enum_appointments_pricing_snapshot_currency";`);
}
