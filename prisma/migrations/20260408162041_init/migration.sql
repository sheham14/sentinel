-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('consumer', 'moderator', 'store_admin');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('terms_of_service', 'marketing_email', 'price_alerts', 'pattern_analysis');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('price_drop', 'reply', 'store_announcement', 'weekly_digest');

-- CreateEnum
CREATE TYPE "DigestFrequency" AS ENUM ('immediate', 'daily', 'weekly', 'none');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('dairy', 'meat_seafood', 'produce', 'bakery_bread', 'frozen', 'pantry_dry_goods', 'snacks_candy', 'beverages', 'household', 'personal_care', 'baby', 'pet', 'deli_prepared', 'health_wellness', 'seasonal', 'other');

-- CreateEnum
CREATE TYPE "PriceSource" AS ENUM ('manual', 'scraper', 'crowdsourced');

-- CreateEnum
CREATE TYPE "PriceReportStatus" AS ENUM ('pending', 'verified', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "PriceReportVerificationMethod" AS ENUM ('dual_corroboration', 'ai_photo_extraction', 'manual_review');

-- CreateEnum
CREATE TYPE "ScrapeRunStatus" AS ENUM ('running', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('tip', 'find', 'question', 'watch_out', 'discussion', 'store_announcement', 'price_drop', 'weekly_flyer');

-- CreateEnum
CREATE TYPE "ContentFlagReason" AS ENUM ('spam', 'misinformation', 'harassment', 'off_topic', 'inappropriate');

-- CreateEnum
CREATE TYPE "ContentFlagStatus" AS ENUM ('pending', 'reviewed_removed', 'reviewed_kept', 'dismissed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'consumer',
    "stripe_customer_id" TEXT,
    "managed_store_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "anonymized_at" TIMESTAMP(3),
    "deletion_requested_at" TIMESTAMP(3),
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT false,
    "marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "digest_frequency" "DigestFrequency" NOT NULL DEFAULT 'weekly',
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferred_stores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_preferred_stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "pantry_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(10,3),
    "unit" TEXT,
    "added_from" TEXT NOT NULL DEFAULT 'manual',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pantry_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postal_code" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "logo_url" TEXT,
    "website_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "portal_enabled" BOOLEAN NOT NULL DEFAULT false,
    "portal_enabled_at" TIMESTAMP(3),

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "category" "ProductCategory",
    "subcategory" TEXT,
    "barcode" TEXT,
    "unit_size" TEXT,
    "unit_measure" TEXT,
    "unit_quantity" DECIMAL(10,3),
    "image_url" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_products" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "store_sku" TEXT,
    "store_product_name" TEXT,
    "scrape_url" TEXT,
    "current_price" DECIMAL(10,2),
    "is_sale" BOOLEAN NOT NULL DEFAULT false,
    "sale_end_date" TIMESTAMP(3),
    "last_scraped_at" TIMESTAMP(3),
    "extraction_failed" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "store_product_id" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_sale" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "submitted_by" TEXT,
    "scraped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "target_price" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "payload" JSONB NOT NULL,
    "sent_at" TIMESTAMP(3),
    "batch_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flyers" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "pdf_url" TEXT,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "household_id" TEXT,
    "name" TEXT NOT NULL DEFAULT 'My List',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_items" (
    "id" TEXT NOT NULL,
    "list_id" TEXT NOT NULL,
    "product_id" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "unit" TEXT,
    "notes" TEXT,
    "is_checked" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "source_url" TEXT,
    "prep_time" INTEGER,
    "cook_time" INTEGER,
    "servings" INTEGER,
    "instructions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "product_id" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(10,3),
    "unit" TEXT,
    "notes" TEXT,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_usage" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "feature_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "consent_type" "ConsentType" NOT NULL,
    "consented" BOOLEAN NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_runs" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "status" "ScrapeRunStatus" NOT NULL DEFAULT 'running',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "total_products" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "error_details" JSONB,
    "alert_sent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "scrape_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_reports" (
    "id" TEXT NOT NULL,
    "store_product_id" TEXT NOT NULL,
    "reported_by" TEXT NOT NULL,
    "reported_price" DECIMAL(10,2) NOT NULL,
    "current_db_price" DECIMAL(10,2),
    "photo_url" TEXT,
    "seen_at" TIMESTAMP(3) NOT NULL,
    "status" "PriceReportStatus" NOT NULL DEFAULT 'pending',
    "verification_method" "PriceReportVerificationMethod",
    "corroborating_report_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "store_id" TEXT,
    "post_type" "PostType" NOT NULL,
    "category_tag" TEXT,
    "topic_tag" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_comment_id" TEXT,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT,
    "comment_id" TEXT,
    "value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_flags" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "post_id" TEXT,
    "comment_id" TEXT,
    "reason" "ContentFlagReason" NOT NULL,
    "details" TEXT,
    "status" "ContentFlagStatus" NOT NULL DEFAULT 'pending',
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_inventory" (
    "id" TEXT NOT NULL,
    "store_product_id" TEXT NOT NULL,
    "in_stock" BOOLEAN NOT NULL DEFAULT true,
    "last_verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "users_stripe_customer_id_idx" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "user_preferred_stores_user_id_idx" ON "user_preferred_stores"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferred_stores_user_id_store_id_key" ON "user_preferred_stores"("user_id", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "pantry_items_user_id_idx" ON "pantry_items"("user_id");

-- CreateIndex
CREATE INDEX "pantry_items_product_id_idx" ON "pantry_items"("product_id");

-- CreateIndex
CREATE INDEX "stores_chain_idx" ON "stores"("chain");

-- CreateIndex
CREATE INDEX "stores_city_province_idx" ON "stores"("city", "province");

-- CreateIndex
CREATE INDEX "stores_is_active_idx" ON "stores"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");

-- CreateIndex
CREATE INDEX "products_name_brand_idx" ON "products"("name", "brand");

-- CreateIndex
CREATE INDEX "store_products_store_id_idx" ON "store_products"("store_id");

-- CreateIndex
CREATE INDEX "store_products_product_id_idx" ON "store_products"("product_id");

-- CreateIndex
CREATE INDEX "store_products_last_scraped_at_idx" ON "store_products"("last_scraped_at");

-- CreateIndex
CREATE INDEX "store_products_extraction_failed_idx" ON "store_products"("extraction_failed");

-- CreateIndex
CREATE UNIQUE INDEX "store_products_store_id_product_id_key" ON "store_products"("store_id", "product_id");

-- CreateIndex
CREATE INDEX "price_history_store_product_id_scraped_at_idx" ON "price_history"("store_product_id", "scraped_at" DESC);

-- CreateIndex
CREATE INDEX "price_history_scraped_at_idx" ON "price_history"("scraped_at");

-- CreateIndex
CREATE INDEX "price_history_source_idx" ON "price_history"("source");

-- CreateIndex
CREATE INDEX "watchlists_user_id_idx" ON "watchlists"("user_id");

-- CreateIndex
CREATE INDEX "watchlists_product_id_idx" ON "watchlists"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "watchlists_user_id_product_id_key" ON "watchlists"("user_id", "product_id");

-- CreateIndex
CREATE INDEX "alerts_user_id_created_at_idx" ON "alerts"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "alerts_batch_id_idx" ON "alerts"("batch_id");

-- CreateIndex
CREATE INDEX "alerts_sent_at_idx" ON "alerts"("sent_at");

-- CreateIndex
CREATE INDEX "flyers_store_id_valid_until_idx" ON "flyers"("store_id", "valid_until" DESC);

-- CreateIndex
CREATE INDEX "flyers_valid_from_valid_until_idx" ON "flyers"("valid_from", "valid_until");

-- CreateIndex
CREATE INDEX "lists_user_id_idx" ON "lists"("user_id");

-- CreateIndex
CREATE INDEX "lists_household_id_idx" ON "lists"("household_id");

-- CreateIndex
CREATE INDEX "list_items_list_id_sort_order_idx" ON "list_items"("list_id", "sort_order");

-- CreateIndex
CREATE INDEX "recipes_title_idx" ON "recipes"("title");

-- CreateIndex
CREATE INDEX "recipe_ingredients_recipe_id_idx" ON "recipe_ingredients"("recipe_id");

-- CreateIndex
CREATE INDEX "recipe_ingredients_product_id_idx" ON "recipe_ingredients"("product_id");

-- CreateIndex
CREATE INDEX "feature_usage_user_id_feature_used_at_idx" ON "feature_usage"("user_id", "feature", "used_at");

-- CreateIndex
CREATE INDEX "feature_usage_used_at_idx" ON "feature_usage"("used_at");

-- CreateIndex
CREATE INDEX "consent_logs_user_id_consent_type_idx" ON "consent_logs"("user_id", "consent_type");

-- CreateIndex
CREATE INDEX "consent_logs_created_at_idx" ON "consent_logs"("created_at");

-- CreateIndex
CREATE INDEX "scrape_runs_store_id_started_at_idx" ON "scrape_runs"("store_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "scrape_runs_status_idx" ON "scrape_runs"("status");

-- CreateIndex
CREATE INDEX "price_reports_store_product_id_status_idx" ON "price_reports"("store_product_id", "status");

-- CreateIndex
CREATE INDEX "price_reports_reported_by_created_at_idx" ON "price_reports"("reported_by", "created_at");

-- CreateIndex
CREATE INDEX "price_reports_status_created_at_idx" ON "price_reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "posts_store_id_created_at_idx" ON "posts"("store_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "posts_post_type_idx" ON "posts"("post_type");

-- CreateIndex
CREATE INDEX "posts_category_tag_idx" ON "posts"("category_tag");

-- CreateIndex
CREATE INDEX "posts_user_id_idx" ON "posts"("user_id");

-- CreateIndex
CREATE INDEX "comments_post_id_created_at_idx" ON "comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "comments_parent_comment_id_idx" ON "comments"("parent_comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_user_id_post_id_key" ON "reactions"("user_id", "post_id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_user_id_comment_id_key" ON "reactions"("user_id", "comment_id");

-- CreateIndex
CREATE INDEX "content_flags_status_idx" ON "content_flags"("status");

-- CreateIndex
CREATE INDEX "content_flags_post_id_idx" ON "content_flags"("post_id");

-- CreateIndex
CREATE INDEX "content_flags_comment_id_idx" ON "content_flags"("comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "store_inventory_store_product_id_key" ON "store_inventory"("store_product_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managed_store_id_fkey" FOREIGN KEY ("managed_store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferred_stores" ADD CONSTRAINT "user_preferred_stores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferred_stores" ADD CONSTRAINT "user_preferred_stores_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pantry_items" ADD CONSTRAINT "pantry_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pantry_items" ADD CONSTRAINT "pantry_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_store_product_id_fkey" FOREIGN KEY ("store_product_id") REFERENCES "store_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flyers" ADD CONSTRAINT "flyers_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_usage" ADD CONSTRAINT "feature_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrape_runs" ADD CONSTRAINT "scrape_runs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_reports" ADD CONSTRAINT "price_reports_store_product_id_fkey" FOREIGN KEY ("store_product_id") REFERENCES "store_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_reports" ADD CONSTRAINT "price_reports_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_reports" ADD CONSTRAINT "price_reports_corroborating_report_id_fkey" FOREIGN KEY ("corroborating_report_id") REFERENCES "price_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_inventory" ADD CONSTRAINT "store_inventory_store_product_id_fkey" FOREIGN KEY ("store_product_id") REFERENCES "store_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
