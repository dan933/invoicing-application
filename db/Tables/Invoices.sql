DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;

CREATE TABLE invoices (
    id VARCHAR PRIMARY KEY,
    status VARCHAR NOT NULL,
    customer_id UUID REFERENCES customers(id),
    invoice_reference SERIAL NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id VARCHAR REFERENCES invoices(id),
    description VARCHAR NOT NULL,
    quantity INT NOT NULL,
    unit_price BIGINT NOT NULL,
    total_price BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);