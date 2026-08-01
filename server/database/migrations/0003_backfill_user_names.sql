-- Custom SQL migration file, put your code below! --
UPDATE "users" SET
  "first_name" = split_part("name", ' ', 1),
  "last_name"  = NULLIF(trim(substring("name" from position(' ' in "name") + 1)), '')
WHERE "first_name" IS NULL;

UPDATE "users" SET "last_name" = '' WHERE "last_name" IS NULL;
