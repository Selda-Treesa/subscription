/*
# Create automation_flows table

1. New Tables
- `automation_flows`: one row per automation workflow shown in the Automation Center.
  - `key` (text, primary key): stable identifier used by the app.
  - `title` (text, not null): display name.
  - `description` (text, not null): what the workflow does.
  - `enabled` (boolean, not null, default false): whether the workflow is switched on.
  - `updated_at` (timestamptz, default now()): last time the flow was changed.

2. Seed data
- Inserts the three default flows (renewal nudges, collections guardrail, upsell suggestions) with the guardrail and renewal flows enabled. Re-running is safe.

3. Security
- Row level security is enabled.
- The app has no sign-in backed by the database, so the anon and authenticated roles get SELECT and UPDATE only. No insert or delete access is granted.
- Policies allow read and update of any row because the data is shared across the single workspace.

4. Notes
- No existing data is modified or removed.
*/

CREATE TABLE IF NOT EXISTS automation_flows (
  key text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE automation_flows ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON automation_flows TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_automation_flows" ON automation_flows;
CREATE POLICY "anon_select_automation_flows" ON automation_flows FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_automation_flows" ON automation_flows;
CREATE POLICY "anon_update_automation_flows" ON automation_flows FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO automation_flows (key, title, description, enabled) VALUES
  ('smart-renewal-nudges', 'Smart renewal nudges', 'Notify customers before renewal and offer swaps using usage patterns.', true),
  ('collections-risk-guardrail', 'Collections risk guardrail', 'Escalate unpaid balances when invoices age beyond the payment terms.', true),
  ('upsell-suggestions', 'Savings / upsell suggestions', 'Recommend product bundles and plan upgrades based on customer usage.', false)
ON CONFLICT (key) DO NOTHING;
