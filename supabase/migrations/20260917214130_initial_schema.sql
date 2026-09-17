CREATE TABLE "public"."customers" (
  "id"         bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "name"       text                     NOT NULL,
  "email"      text,
  "phone"      text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "customers_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."customers"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."glass_types" (
  "id"         bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "name"       text                     NOT NULL,
  "unit_cost"  numeric(10,2)            NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "glass_types_name_key" UNIQUE (name),
  CONSTRAINT "glass_types_pkey" PRIMARY KEY (id),
  CONSTRAINT "glass_types_unit_cost_check" CHECK ((unit_cost >= (0)::numeric))
);

ALTER TABLE "public"."glass_types"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."orders" (
  "id"                bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "quote_id"          bigint                   NOT NULL,
  "installation_date" date                     NOT NULL,
  "status"            text                     NOT NULL,
  "completed_at"      timestamp with time zone,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "orders_pkey" PRIMARY KEY (id),
  CONSTRAINT "orders_quote_id_key" UNIQUE (quote_id),
  CONSTRAINT "orders_status_check" CHECK ((status = ANY (ARRAY['scheduled'::text, 'completed'::text]))),
  CONSTRAINT "orders_status_completed_at_check" CHECK ((((status = 'scheduled'::text) AND (completed_at IS NULL)) OR ((status = 'completed'::text) AND (completed_at IS NOT NULL))))
);

ALTER TABLE "public"."orders"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."quote_line_items" (
  "id"             bigint        GENERATED ALWAYS AS IDENTITY NOT NULL,
  "quote_id"       bigint        NOT NULL,
  "window_type_id" bigint        NOT NULL,
  "glass_type_id"  bigint        NOT NULL,
  "width_in"       numeric(6,2)  NOT NULL,
  "height_in"      numeric(6,2)  NOT NULL,
  "quantity"       integer       NOT NULL,
  "line_total"     numeric(10,2) NOT NULL,
  CONSTRAINT "quote_line_items_height_in_check" CHECK ((height_in > (0)::numeric)),
  CONSTRAINT "quote_line_items_line_total_check" CHECK ((line_total >= (0)::numeric)),
  CONSTRAINT "quote_line_items_pkey" PRIMARY KEY (id),
  CONSTRAINT "quote_line_items_quantity_check" CHECK ((quantity > 0)),
  CONSTRAINT "quote_line_items_width_in_check" CHECK ((width_in > (0)::numeric))
);

ALTER TABLE "public"."quote_line_items"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."quotes" (
  "id"             bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "customer_id"    bigint                   NOT NULL,
  "status"         text                     NOT NULL,
  "total"          numeric(10,2)            NOT NULL,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "approved_at"    timestamp with time zone,
  "declined_at"    timestamp with time zone,
  "decline_reason" text,
  CONSTRAINT "quotes_pkey" PRIMARY KEY (id),
  CONSTRAINT "quotes_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'declined'::text]))),
  CONSTRAINT "quotes_status_timestamps_check"
    CHECK ((((status = 'pending'::text) AND (approved_at IS NULL) AND (declined_at IS NULL)) OR ((status = 'approved'::text) AND (approved_at IS
    NOT NULL) AND (declined_at IS NULL)) OR ((status = 'declined'::text) AND (declined_at IS NOT NULL) AND (approved_at IS NULL)))),
  CONSTRAINT "quotes_total_check" CHECK ((total >= (0)::numeric))
);

ALTER TABLE "public"."quotes"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."window_types" (
  "id"         bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "name"       text                     NOT NULL,
  "labor_cost" numeric(10,2)            NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "window_types_labor_cost_check" CHECK ((labor_cost >= (0)::numeric)),
  CONSTRAINT "window_types_name_key" UNIQUE (name),
  CONSTRAINT "window_types_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."window_types"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."quote_line_items"
  ADD CONSTRAINT "quote_line_items_glass_type_id_fkey" FOREIGN KEY (glass_type_id) REFERENCES public.glass_types(id);

ALTER TABLE "public"."quotes"
  ADD CONSTRAINT "quotes_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id);

ALTER TABLE "public"."orders"
  ADD CONSTRAINT "orders_quote_id_fkey" FOREIGN KEY (quote_id) REFERENCES public.quotes(id);

ALTER TABLE "public"."quote_line_items"
  ADD CONSTRAINT "quote_line_items_quote_id_fkey" FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

ALTER TABLE "public"."quote_line_items"
  ADD CONSTRAINT "quote_line_items_window_type_id_fkey" FOREIGN KEY (window_type_id) REFERENCES public.window_types(id);

CREATE INDEX quote_line_items_glass_type_id_idx ON public.quote_line_items USING btree (glass_type_id);

CREATE INDEX quote_line_items_quote_id_idx ON public.quote_line_items USING btree (quote_id);

CREATE INDEX quote_line_items_window_type_id_idx ON public.quote_line_items USING btree (window_type_id);

CREATE INDEX quotes_customer_id_idx ON public.quotes USING btree (customer_id);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."customers" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."glass_types" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."orders" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."quote_line_items" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."quotes" TO "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."window_types" TO "postgres", "service_role";

-- Supabase's default privileges on the public schema auto-grant anon/authenticated
-- on every new table. This is an internal tool with no direct Postgrest access for
-- those roles — all access goes through the privileged server-side client
-- (lib/db/server.ts). Revoke explicitly so it isn't relying on RLS alone.
REVOKE ALL ON TABLE "public"."customers", "public"."window_types", "public"."glass_types", "public"."quotes", "public"."quote_line_items", "public"."orders" FROM "anon", "authenticated";

