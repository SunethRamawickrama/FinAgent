INSERT INTO accounts (account_name, account_type, institution, account_number, current_balance) VALUES
('Primary Checking',  'checking',     'Chase Bank',      '4821', 3240.50),
('High Yield Savings','savings',      'Marcus by GS',    '9034', 12800.00),
('Rewards Visa',      'credit_card',  'Chase Bank',      '7741', -1420.75),
('Debit Card',        'checking',     'Bank of America', '3312', 890.00);

INSERT INTO finance_plans (plan_name, start_date, end_date, monthly_income, spending_limit, savings_goal, status) VALUES
('Q1 2025 Budget',    '2025-01-01', '2025-03-31', 6500.00, 4500.00, 2000.00, 'completed'),
('Spring Budget',     '2025-04-01', '2025-06-30', 6500.00, 4200.00, 2300.00, 'active'),
('Emergency Fund Run','2024-10-01', '2024-12-31', 6500.00, 3800.00, 2700.00, 'completed');

INSERT INTO categories (name, type, budget_amount, color_code) VALUES
('Rent',              'expense', 1800.00, '#FF6B6B'),
('Groceries',         'expense',  400.00, '#4ECDC4'),
('Transport',         'expense',  200.00, '#45B7D1'),
('Dining Out',        'expense',  250.00, '#FFA07A'),
('Subscriptions',     'expense',  100.00, '#98D8C8'),
('Entertainment',     'expense',  150.00, '#DDA0DD'),
('Healthcare',        'expense',  200.00, '#90EE90'),
('Utilities',         'expense',  180.00, '#F0E68C'),
('Salary',            'income',  NULL,    '#32CD32'),
('Freelance',         'income',  NULL,    '#228B22');

INSERT INTO transactions (plan_id, account_id, category_id, description, amount, type, merchant_name, merchant_city, transaction_date, is_recurring) VALUES
(2, 1, 1,  'April Rent Payment',         1800.00, 'debit',  'Sunset Apartments',   'Washington DC', '2025-04-01', TRUE),
(2, 1, 9,  'Salary Deposit April',       6500.00, 'credit', 'Anthropic Inc',       'San Francisco', '2025-04-01', TRUE),
(2, 3, 4,  'Dinner with friends',           87.50, 'debit', 'Founding Farmers',    'Washington DC', '2025-04-02', FALSE),
(2, 3, 2,  'Weekly groceries',             134.20, 'debit', 'Whole Foods Market',  'Washington DC', '2025-04-03', FALSE),
(2, 3, 5,  'Netflix Monthly',               17.99, 'debit', 'Netflix',             'Los Gatos CA',  '2025-04-04', TRUE),
(2, 3, 5,  'Spotify Premium',               11.99, 'debit', 'Spotify',             'New York NY',   '2025-04-04', TRUE),
(2, 3, 3,  'Metro Card Reload',             50.00, 'debit', 'WMATA',               'Washington DC', '2025-04-05', FALSE),
(2, 3, 6,  'Movie tickets',                 32.00, 'debit', 'AMC Theatres',        'Washington DC', '2025-04-06', FALSE),
(2, 3, 2,  'Trader Joes run',               89.40, 'debit', 'Trader Joes',         'Washington DC', '2025-04-07', FALSE),
(2, 1, 10, 'Freelance design project',     800.00, 'credit','Client - TechStartup','Remote',        '2025-04-08', FALSE),
(2, 3, 7,  'Dentist appointment',          180.00, 'debit', 'Capitol Dental',      'Washington DC', '2025-04-09', FALSE),
(2, 3, 4,  'Lunch with colleague',          24.75, 'debit', 'Sweetgreen',          'Washington DC', '2025-04-10', FALSE),
(2, 3, 8,  'Electric bill',               112.40, 'debit', 'PEPCO',               'Washington DC', '2025-04-10', TRUE),
(2, 3, 8,  'Internet bill',                79.99, 'debit', 'Xfinity',             'Washington DC', '2025-04-11', TRUE),
(2, 3, 2,  'Costco bulk shopping',        210.30, 'debit', 'Costco',              'Hyattsville MD', '2025-04-12', FALSE),
(2, 3, 3,  'Uber to airport',              43.20, 'debit', 'Uber',                'Washington DC', '2025-04-13', FALSE),
(2, 3, 6,  'Concert tickets',             145.00, 'debit', 'Ticketmaster',        'Washington DC', '2025-04-14', FALSE),
(2, 3, 4,  'Team dinner',                  67.80, 'debit', 'RPM Italian',         'Washington DC', '2025-04-15', FALSE),
(2, 2, 9,  'Savings transfer',            500.00, 'credit','Internal Transfer',   'N/A',           '2025-04-15', FALSE),
(2, 3, 5,  'iCloud Storage',                2.99, 'debit', 'Apple',               'Cupertino CA',  '2025-04-16', TRUE);

INSERT INTO recurring_payments (account_id, category_id, description, amount, frequency, next_due_date) VALUES
(1, 1,  'Rent',           1800.00, 'monthly', '2025-05-01'),
(3, 5,  'Netflix',          17.99, 'monthly', '2025-05-04'),
(3, 5,  'Spotify',          11.99, 'monthly', '2025-05-04'),
(3, 8,  'Electric Bill',   112.40, 'monthly', '2025-05-10'),
(3, 8,  'Internet',         79.99, 'monthly', '2025-05-11'),
(3, 5,  'iCloud',            2.99, 'monthly', '2025-05-16');