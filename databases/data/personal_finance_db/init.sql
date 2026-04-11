CREATE TABLE accounts (
    id              SERIAL PRIMARY KEY,
    account_name    VARCHAR(100) NOT NULL,
    account_type    VARCHAR(50) NOT NULL,      -- checking, savings, credit_card
    institution     VARCHAR(100) NOT NULL,
    account_number  VARCHAR(20),               
    current_balance NUMERIC(12, 2) DEFAULT 0,
    currency        VARCHAR(10) DEFAULT 'USD',
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE finance_plans (
    id              SERIAL PRIMARY KEY,
    plan_name       VARCHAR(100) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    monthly_income  NUMERIC(12, 2) NOT NULL,
    spending_limit  NUMERIC(12, 2) NOT NULL,
    savings_goal    NUMERIC(12, 2),
    status          VARCHAR(20) DEFAULT 'active',  -- active, completed, paused
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(20) NOT NULL,       -- expense, income
    budget_amount   NUMERIC(12, 2),
    color_code      VARCHAR(10)
);

CREATE TABLE transactions (
    id              SERIAL PRIMARY KEY,
    plan_id         INTEGER REFERENCES finance_plans(id),
    account_id      INTEGER REFERENCES accounts(id),
    category_id     INTEGER REFERENCES categories(id),
    description     VARCHAR(255) NOT NULL,
    amount          NUMERIC(12, 2) NOT NULL,
    type            VARCHAR(20) NOT NULL,       -- debit, credit
    merchant_name   VARCHAR(100),
    merchant_city   VARCHAR(100),
    transaction_date DATE NOT NULL,
    is_recurring    BOOLEAN DEFAULT FALSE,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recurring_payments (
    id              SERIAL PRIMARY KEY,
    account_id      INTEGER REFERENCES accounts(id),
    category_id     INTEGER REFERENCES categories(id),
    description     VARCHAR(255) NOT NULL,
    amount          NUMERIC(12, 2) NOT NULL,
    frequency       VARCHAR(20) NOT NULL,       -- monthly, weekly, annual
    next_due_date   DATE NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE
);