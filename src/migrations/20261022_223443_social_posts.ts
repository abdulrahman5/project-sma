import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_social_posts_platform" AS ENUM('facebook', 'instagram', 'x');
  CREATE TYPE "public"."enum_social_posts_source" AS ENUM('imported', 'manual');
  CREATE TABLE "social_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"platform" "enum_social_posts_platform" DEFAULT 'x' NOT NULL,
  	"url" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"posted_at" timestamp(3) with time zone NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"source" "enum_social_posts_source" DEFAULT 'manual',
  	"external_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "social_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"import_facebook" boolean DEFAULT true,
  	"import_instagram" boolean DEFAULT true,
  	"last_sync_at" timestamp(3) with time zone,
  	"last_sync_summary" varchar,
  	"ignored_ids" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "social_posts_id" integer;
  ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "social_posts_image_idx" ON "social_posts" USING btree ("image_id");
  CREATE UNIQUE INDEX "social_posts_external_id_idx" ON "social_posts" USING btree ("external_id");
  CREATE INDEX "social_posts_updated_at_idx" ON "social_posts" USING btree ("updated_at");
  CREATE INDEX "social_posts_created_at_idx" ON "social_posts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_social_posts_fk" FOREIGN KEY ("social_posts_id") REFERENCES "public"."social_posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_social_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("social_posts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "social_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "social_posts" CASCADE;
  DROP TABLE "social_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_social_posts_fk";
  
  DROP INDEX "payload_locked_documents_rels_social_posts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "social_posts_id";
  DROP TYPE "public"."enum_social_posts_platform";
  DROP TYPE "public"."enum_social_posts_source";`)
}
