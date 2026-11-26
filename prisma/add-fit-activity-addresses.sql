-- Product filter attrs (Fit / Activity)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "fit" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "activity" TEXT;

CREATE INDEX IF NOT EXISTS "Product_fit_idx" ON "Product"("fit");
CREATE INDEX IF NOT EXISTS "Product_activity_idx" ON "Product"("activity");

-- Customer accounts (if missing on older DBs)
CREATE TABLE IF NOT EXISTS "Customer" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_email_key" ON "Customer"("email");
CREATE INDEX IF NOT EXISTS "Customer_email_idx" ON "Customer"("email");

-- Saved customer addresses
CREATE TABLE IF NOT EXISTS "CustomerAddress" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "label" TEXT NOT NULL DEFAULT 'Home',
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "addressLine1" TEXT NOT NULL,
  "addressLine2" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT,
  "postalCode" TEXT NOT NULL,
  "country" TEXT NOT NULL DEFAULT 'PK',
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CustomerAddress_customerId_idx" ON "CustomerAddress"("customerId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CustomerAddress_customerId_fkey'
  ) THEN
    ALTER TABLE "CustomerAddress"
      ADD CONSTRAINT "CustomerAddress_customerId_fkey"
      FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
