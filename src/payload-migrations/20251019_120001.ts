import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "appointments" ADD COLUMN "patient_folder_id" integer;
    ALTER TABLE "appointments" ADD COLUMN "private_notes" jsonb;
    ALTER TABLE "appointments" ADD COLUMN "visit_summary" jsonb;
    ALTER TABLE "appointments" ADD COLUMN "treatment_plan_instructions" jsonb;
    ALTER TABLE "appointments" ADD COLUMN "treatment_plan_follow_up_date" timestamp(3) with time zone;
    ALTER TABLE "appointments" ADD COLUMN "patient_feedback_score" numeric;
    ALTER TABLE "appointments" ADD COLUMN "patient_feedback_submitted_at" timestamp(3) with time zone;
    ALTER TABLE "appointments" ADD COLUMN "patient_feedback_comment" varchar;

    CREATE TABLE "appointments_clinical_documents" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "media_id" integer
    );

    CREATE TABLE "appointments_treatment_plan_care_team" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "providers_id" integer
    );

    CREATE TABLE "appointments_prescriptions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "medication" varchar,
      "dosage" varchar,
      "frequency" varchar,
      "duration" varchar,
      "notes" varchar,
      "document_id" integer
    );

    CREATE TABLE "patients" (
      "id" serial PRIMARY KEY NOT NULL,
      "owner_id" integer NOT NULL,
      "display_name" varchar NOT NULL,
      "primary_provider_id" integer,
      "theme_preferences_color_scheme" varchar,
      "theme_preferences_accent_color" varchar,
      "theme_preferences_density" varchar,
      "sharing_preferences_allow_patient_download" boolean DEFAULT false,
      "sharing_preferences_allow_patient_notes" boolean DEFAULT false,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "patients_patient_folders" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "description" varchar,
      "notes" jsonb
    );

    CREATE TABLE "patients_patient_folders_documents" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "media_id" integer
    );

    CREATE TABLE "patients_visit_notes" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "appointment_id" integer,
      "note" varchar,
      "is_private" boolean,
      "author_id" integer,
      "created_at" timestamp(3) with time zone
    );

    CREATE TABLE "patients_prescriptions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "medication" varchar,
      "dosage" varchar,
      "instructions" varchar,
      "issued_at" timestamp(3) with time zone,
      "prescribed_by_id" integer,
      "refills" integer,
      "status" varchar,
      "document_id" integer
    );
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "patients_prescriptions";
    DROP TABLE IF EXISTS "patients_visit_notes";
    DROP TABLE IF EXISTS "patients_patient_folders_documents";
    DROP TABLE IF EXISTS "patients_patient_folders";
    DROP TABLE IF EXISTS "patients";
    DROP TABLE IF EXISTS "appointments_prescriptions";
    DROP TABLE IF EXISTS "appointments_treatment_plan_care_team";
    DROP TABLE IF EXISTS "appointments_clinical_documents";
    ALTER TABLE "appointments" DROP COLUMN IF EXISTS "patient_feedback_comment";
    ALTER TABLE "appointments" DROP COLUMN IF EXISTS "patient_feedback_submitted_at";
    ALTER TABLE "appointments" DROP COLUMN IF EXISTS "patient_feedback_score";
    ALTER TABLE "appointments" DROP COLUMN IF EXISTS "treatment_plan_follow_up_date";
    ALTER TABLE "appointments" DROP COLUMN IF EXISTS "treatment_plan_instructions";
    ALTER TABLE "appointments" DROP COLUMN IF EXISTS "visit_summary";
    ALTER TABLE "appointments" DROP COLUMN IF EXISTS "private_notes";
    ALTER TABLE "appointments" DROP COLUMN IF EXISTS "patient_folder_id";
  `);
}
