INSERT INTO cost_centers (code, name, department, budget_annual, manager) VALUES
('CC-ENG-001', 'Core Engineering',       'Engineering',  2400000.00, 'Sarah Chen'),
('CC-MKT-001', 'Digital Marketing',      'Marketing',     800000.00, 'James Okafor'),
('CC-OPS-001', 'Operations',             'Operations',   1200000.00, 'Maria Torres'),
('CC-FIN-001', 'Finance & Accounting',   'Finance',       600000.00, 'David Park'),
('CC-HR-001',  'Human Resources',        'HR',            400000.00, 'Lisa Nguyen');

INSERT INTO vendors (vendor_name, vendor_code, contact_email, payment_terms, contract_status, risk_tier, country, annual_spend, onboarded_at, contract_expiry) VALUES
('AWS Cloud Services',      'VND-001', 'billing@aws.amazon.com',     'NET30',      'active',       'low',    'USA',   480000.00, '2020-01-15', '2026-01-15'),
('Salesforce Inc',          'VND-002', 'accounts@salesforce.com',    'NET30',      'active',       'low',    'USA',   120000.00, '2021-03-01', '2025-03-01'),
('Global Staffing Partners','VND-003', 'finance@gspstaffing.com',    'NET60',      'under_review', 'high',   'India',  95000.00, '2022-06-10', '2025-06-10'),
('Office Depot Business',   'VND-004', 'business@officedepot.com',   'immediate',  'active',       'low',    'USA',    18000.00, '2019-08-20', '2026-08-20'),
('CyberSec Solutions LLC',  'VND-005', 'billing@cybersec.io',        'NET30',      'active',       'medium', 'USA',    72000.00, '2023-01-01', '2025-12-31'),
('Expired Vendor Co',       'VND-006', 'contact@expiredvendor.com',  'NET30',      'expired',      'high',   'USA',    34000.00, '2018-05-01', '2024-01-01');

INSERT INTO general_ledger (entry_date, period, account_code, account_name, description, debit_amount, credit_amount, cost_center_id, posted_by, approved_by, is_reconciled) VALUES
('2025-01-31', '2025-Q1', '5100', 'Cloud Infrastructure',   'AWS Jan invoice',              40000.00, 0,        1, 'david.park', 'sarah.chen',   TRUE),
('2025-01-31', '2025-Q1', '5200', 'Software Licenses',      'Salesforce Jan subscription',  10000.00, 0,        2, 'david.park', 'james.okafor', TRUE),
('2025-01-31', '2025-Q1', '1000', 'Cash',                   'Payment to AWS',               0,        40000.00, 1, 'david.park', 'sarah.chen',   TRUE),
('2025-02-28', '2025-Q1', '5100', 'Cloud Infrastructure',   'AWS Feb invoice',              40000.00, 0,        1, 'david.park', 'sarah.chen',   TRUE),
('2025-02-28', '2025-Q1', '5300', 'Contract Labor',         'Global Staffing Feb',          28000.00, 0,        3, 'david.park', NULL,           FALSE),
('2025-03-15', '2025-Q1', '5400', 'Security Services',      'CyberSec Q1 retainer',         18000.00, 0,        1, 'david.park', 'sarah.chen',   TRUE),
('2025-03-31', '2025-Q1', '5100', 'Cloud Infrastructure',   'AWS Mar invoice',              40000.00, 0,        1, 'david.park', 'sarah.chen',   FALSE),
('2025-03-31', '2025-Q1', '5500', 'Office Supplies',        'Office Depot Q1 supplies',      4200.00, 0,        3, 'lisa.nguyen', NULL,          FALSE),
('2025-04-01', '2025-Q2', '5100', 'Cloud Infrastructure',   'AWS Apr invoice',              40000.00, 0,        1, 'david.park', NULL,           FALSE),
('2025-04-01', '2025-Q2', '5300', 'Contract Labor',         'Global Staffing Apr — no PO',  31000.00, 0,        3, 'david.park', NULL,           FALSE);

INSERT INTO invoices (invoice_number, vendor_id, cost_center_id, invoice_date, due_date, amount, tax_amount, status, approved_by, approved_at, paid_at, payment_method, description, has_po, po_number) VALUES
('INV-AWS-2025-001',  1, 1, '2025-01-01', '2025-01-31', 40000.00, 0,      'paid',     'sarah.chen',   '2025-01-05 09:00:00', '2025-01-28 10:00:00', 'wire',  'AWS Jan cloud services',         TRUE,  'PO-2025-001'),
('INV-AWS-2025-002',  1, 1, '2025-02-01', '2025-02-28', 40000.00, 0,      'paid',     'sarah.chen',   '2025-02-03 09:00:00', '2025-02-25 10:00:00', 'wire',  'AWS Feb cloud services',         TRUE,  'PO-2025-002'),
('INV-AWS-2025-003',  1, 1, '2025-03-01', '2025-03-31', 40000.00, 0,      'approved', 'sarah.chen',   '2025-03-03 09:00:00', NULL,                  NULL,    'AWS Mar cloud services',         TRUE,  'PO-2025-003'),
('INV-SF-2025-001',   2, 2, '2025-01-01', '2025-01-31', 10000.00, 0,      'paid',     'james.okafor', '2025-01-04 11:00:00', '2025-01-30 10:00:00', 'ach',   'Salesforce Jan license',         TRUE,  'PO-2025-010'),
('INV-GSP-2025-001',  3, 3, '2025-02-15', '2025-03-15', 28000.00, 0,      'disputed', NULL,           NULL,                  NULL,                  NULL,    'Contract staffing Feb — disputed',FALSE, NULL),
('INV-CS-2025-001',   5, 1, '2025-01-15', '2025-02-15', 18000.00, 1620.0, 'paid',     'sarah.chen',   '2025-01-20 10:00:00', '2025-02-10 10:00:00', 'wire',  'CyberSec Q1 security retainer',  TRUE,  'PO-2025-020'),
('INV-OD-2025-001',   4, 3, '2025-03-10', '2025-04-10', 4200.00,  378.00, 'pending',  NULL,           NULL,                  NULL,                  NULL,    'Office supplies Q1',             FALSE, NULL),
('INV-EXP-2025-001',  6, 2, '2025-03-01', '2025-03-31', 12000.00, 0,      'pending',  NULL,           NULL,                  NULL,                  NULL,    'Invoice from expired vendor',    FALSE, NULL),
('INV-GSP-2025-002',  3, 3, '2025-04-01', '2025-05-01', 31000.00, 0,      'pending',  NULL,           NULL,                  NULL,                  NULL,    'Contract staffing Apr — no PO',  FALSE, NULL),
('INV-AWS-2025-004',  1, 1, '2025-04-01', '2025-04-30', 52000.00, 0,      'pending',  NULL,           NULL,                  NULL,                  NULL,    'AWS Apr — 30% spike vs prior mo',TRUE,  'PO-2025-004');

INSERT INTO expense_reports (report_number, employee_name, employee_email, department, cost_center_id, period_start, period_end, total_amount, status, approved_by, approved_at, policy_compliant) VALUES
('EXP-2025-001', 'James Okafor',  'james.okafor@company.com',  'Marketing',   2, '2025-03-01', '2025-03-31', 1240.00, 'approved', 'maria.torres', '2025-04-02 10:00:00', TRUE),
('EXP-2025-002', 'Sarah Chen',    'sarah.chen@company.com',    'Engineering', 1, '2025-03-01', '2025-03-31',  380.00, 'approved', 'david.park',   '2025-04-01 09:00:00', TRUE),
('EXP-2025-003', 'Ryan Mitchell', 'ryan.m@company.com',        'Sales',       2, '2025-03-01', '2025-03-31', 3450.00, 'under_review', NULL,        NULL,                 FALSE),
('EXP-2025-004', 'Lisa Nguyen',   'lisa.nguyen@company.com',   'HR',          5, '2025-04-01', '2025-04-30',  215.00, 'submitted', NULL,           NULL,                 TRUE),
('EXP-2025-005', 'Unknown Staff', NULL,                         NULL,          NULL,'2025-02-01','2025-02-28', 890.00, 'approved', 'david.park',   '2025-03-05 10:00:00', TRUE);

INSERT INTO expense_line_items (report_id, category, description, amount, expense_date, receipt_attached, is_flagged, flag_reason) VALUES
(1, 'travel',    'Flight NYC to SF — client meeting',   520.00, '2025-03-12', TRUE,  FALSE, NULL),
(1, 'meals',     'Client dinner — 4 people',            280.00, '2025-03-12', TRUE,  FALSE, NULL),
(1, 'hotel',     'Hotel SF 2 nights',                   440.00, '2025-03-13', TRUE,  FALSE, NULL),
(2, 'software',  'GitHub Copilot annual',               190.00, '2025-03-05', TRUE,  FALSE, NULL),
(2, 'meals',     'Team lunch',                          190.00, '2025-03-20', FALSE, FALSE, NULL),
(3, 'travel',    'First class flight — NYC to London', 4200.00, '2025-03-08', FALSE, TRUE,  'First class not covered by policy'),
(3, 'meals',     'Client entertainment — alcohol',      380.00, '2025-03-09', FALSE, TRUE,  'Alcohol requires VP approval'),
(3, 'hotel',     'Hotel London 3 nights — no receipt',  870.00, '2025-03-10', FALSE, TRUE,  'No receipt attached over $500'),
(4, 'office',    'Standing desk accessories',           215.00, '2025-04-10', TRUE,  FALSE, NULL),
(5, 'misc',      'Unspecified expenses',                890.00, '2025-02-15', FALSE, TRUE,  'No receipts, no description, no employee record');

INSERT INTO audit_log (table_name, record_id, action, performed_by, performed_at, ip_address) VALUES
('invoices',        8, 'VIEW',   'david.park',    '2025-04-01 08:45:00', '10.0.1.42'),
('invoices',        9, 'INSERT', 'david.park',    '2025-04-01 09:00:00', '10.0.1.42'),
('general_ledger', 10, 'INSERT', 'david.park',    '2025-04-01 09:05:00', '10.0.1.42'),
('invoices',        6, 'VIEW',   'unknown_user',  '2025-04-02 23:12:00', '185.220.101.5'),
('expense_reports', 3, 'UPDATE', 'ryan.m',        '2025-04-03 11:20:00', '10.0.1.88'),
('invoices',        8, 'VIEW',   'james.okafor',  '2025-04-03 14:00:00', '10.0.1.55'),
('general_ledger',  5, 'UPDATE', 'david.park',    '2025-04-04 09:30:00', '10.0.1.42'),
('vendors',         6, 'VIEW',   'david.park',    '2025-04-05 10:00:00', '10.0.1.42');