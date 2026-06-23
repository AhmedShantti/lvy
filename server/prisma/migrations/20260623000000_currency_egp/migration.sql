-- Switch the default currency from USD to EGP for new rows.
-- (Existing rows keep their stored value; numeric prices are unchanged.)
ALTER TABLE "Product" ALTER COLUMN "currency" SET DEFAULT 'EGP';
ALTER TABLE "Order" ALTER COLUMN "currency" SET DEFAULT 'EGP';
