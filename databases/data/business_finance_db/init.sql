CREATE TABLE cost_centers (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(20) UNIQUE NOT NULL,   -- e.g. CC-ENG-001
    name            VARCHAR(100) NOT NULL,
    department      VARCHAR(100) NOT NULL,
    budget_annual   NUMERIC(15, 2) NOT NULL,
    manager         VARCHAR(100),
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE vendors (
    id              SERIAL PRIMARY KEY,
    vendor_name     VARCHAR(255) NOT NULL,
    vendor_code     VARCHAR(50) UNIQUE NOT NULL,
    contact_email   VARCHAR(255),
    payment_terms   VARCHAR(50),                   -- NET30, NET60, immediate
    contract_status VARCHAR(50) DEFAULT 'active',  -- active, expired, under_review
    risk_tier       VARCHAR(20) DEFAULT 'low',     -- low, medium, high
    country         VARCHAR(100),
    annual_spend    NUMERIC(15, 2) DEFAULT 0,
    onboarded_at    DATE,
    contract_expiry DATE
);

CREATE TABLE general_ledger (
    id              SERIAL PRIMARY KEY,
    entry_date      DATE NOT NULL,
    period          VARCHAR(20) NOT NULL,           -- e.g. 2025-Q1
    account_code    VARCHAR(20) NOT NULL,
    account_name    VARCHAR(100) NOT NULL,
    description     TEXT NOT NULL,
    debit_amount    NUMERIC(15, 2) DEFAULT 0,
    credit_amount   NUMERIC(15, 2) DEFAULT 0,
    cost_center_id  INTEGER REFERENCES cost_centers(id),
    posted_by       VARCHAR(100),
    approved_by     VARCHAR(100),
    is_reconciled   BOOLEAN DEFAULT FALSE,
    notes           TEXT
);

CREATE TABLE invoices (
    id              SERIAL PRIMARY KEY,
    invoice_number  VARCHAR(100) UNIQUE NOT NULL,
    vendor_id       INTEGER REFERENCES vendors(id),
    cost_center_id  INTEGER REFERENCES cost_centers(id),
    invoice_date    DATE NOT NULL,
    due_date        DATE NOT NULL,
    amount          NUMERIC(15, 2) NOT NULL,
    tax_amount      NUMERIC(15, 2) DEFAULT 0,
    status          VARCHAR(50) DEFAULT 'pending', -- pending, approved, paid, overdue, disputed
    approved_by     VARCHAR(100),
    approved_at     TIMESTAMP,
    paid_at         TIMESTAMP,
    payment_method  VARCHAR(50),
    description     TEXT,
    has_po          BOOLEAN DEFAULT FALSE,         -- has matching purchase order
    po_number       VARCHAR(100)
);

CREATE TABLE expense_reports (
    id              SERIAL PRIMARY KEY,
    report_number   VARCHAR(50) UNIQUE NOT NULL,
    employee_name   VARCHAR(100) NOT NULL,
    employee_email  VARCHAR(255),
    department      VARCHAR(100),
    cost_center_id  INTEGER REFERENCES cost_centers(id),
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    total_amount    NUMERIC(12, 2) NOT NULL,
    status          VARCHAR(50) DEFAULT 'submitted', -- submitted, under_review, approved, rejected, paid
    submitted_at    TIMESTAMP DEFAULT NOW(),
    approved_by     VARCHAR(100),
    approved_at     TIMESTAMP,
    policy_compliant BOOLEAN DEFAULT TRUE,
    notes           TEXT
);

CREATE TABLE expense_line_items (
    id                  SERIAL PRIMARY KEY,
    report_id           INTEGER REFERENCES expense_reports(id),
    category            VARCHAR(100) NOT NULL,     -- travel, meals, software, equipment
    description         VARCHAR(255) NOT NULL,
    amount              NUMERIC(12, 2) NOT NULL,
    expense_date        DATE NOT NULL,
    receipt_attached    BOOLEAN DEFAULT FALSE,
    is_flagged          BOOLEAN DEFAULT FALSE,
    flag_reason         TEXT
);

CREATE TABLE audit_log (
    id              SERIAL PRIMARY KEY,
    table_name      VARCHAR(100) NOT NULL,
    record_id       INTEGER NOT NULL,
    action          VARCHAR(50) NOT NULL,           -- INSERT, UPDATE, DELETE, VIEW
    performed_by    VARCHAR(100) NOT NULL,
    performed_at    TIMESTAMP DEFAULT NOW(),
    old_values      JSONB,
    new_values      JSONB,
    ip_address      VARCHAR(50),
    session_id      VARCHAR(100)
);