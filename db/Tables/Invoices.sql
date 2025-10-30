DROP VIEW IF EXISTS invoice_summaries;
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;

GO

CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    status VARCHAR NOT NULL,
    customer_id UUID REFERENCES customers(id),
    invoice_reference SERIAL NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    gst BOOLEAN NOT NULL DEFAULT FALSE,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

GO

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    description VARCHAR NOT NULL,
    quantity INT NOT NULL,
    unit_price BIGINT NOT NULL,
    total_price BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

GO

CREATE VIEW invoice_summaries AS
SELECT invoices.id, invoices.customer_id, cust.customer_code, cust.first_name, cust.last_name, cust.company, cust.email,invoice_reference, invoices.status, invoice_date, due_date, SUM(item.total_price) as total_price, gst, paid from invoices
LEFT JOIN invoice_items as item ON invoices.id = item.invoice_id
INNER JOIN customers AS cust ON invoices.customer_id = cust.id
WHERE invoices.status = 'Active'
GROUP BY invoices.id, invoices.customer_id, cust.customer_code, cust.first_name, cust.last_name, cust.company, cust.email,invoice_reference, invoices.status, invoice_date, due_date, gst, paid;
