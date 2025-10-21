CREATE TABLE customers (
    id VARCHAR PRIMARY KEY,
    status VARCHAR NOT NULL,
    customer_code VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    company VARCHAR,
    email VARCHAR,
    active_status BOOLEAN,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);