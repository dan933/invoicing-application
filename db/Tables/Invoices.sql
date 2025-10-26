CREATE TABLE invoices (
    id VARCHAR PRIMARY KEY,
    status VARCHAR NOT NULL,
    customer_id UUID REFERENCES customers(id),
    invoice_reference VARCHAR NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE UNIQUE INDEX invoice_reference_unique 
ON invoices (invoice_reference) WHERE status = 'Active';

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