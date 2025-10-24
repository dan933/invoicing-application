CREATE TABLE customers (
    id VARCHAR PRIMARY KEY,
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