DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    id UUID PRIMARY KEY,
    status VARCHAR NOT NULL,
    customer_code VARCHAR NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    company VARCHAR,
    email VARCHAR,
    active_status BOOLEAN,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX customers_customer_code_active_unique 
ON customers (customer_code) WHERE status = 'Active';

CREATE VIEW customer_summaries AS
SELECT cust.*, COUNT(CASE WHEN inv.paid = false AND inv.status = 'Active' THEN 1 END) as outstanding_count, COUNT(CASE WHEN inv.paid = false AND inv.status = 'Active' AND due_date < CURRENT_DATE THEN 1 END) as overdue_count
FROM customers AS cust
LEFT JOIN invoices AS inv ON cust.id = inv.customer_id
WHERE cust.status = 'Active'
GROUP BY cust.id, cust.status, cust.customer_code, cust.first_name, cust.last_name, cust.company, cust.email, cust.active_status, cust.created_at, cust.updated_at;