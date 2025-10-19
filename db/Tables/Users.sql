DROP TABLE IF EXISTS Permissions;
DROP TABLE IF EXISTS Users;


CREATE TABLE Users (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Status VARCHAR(50) NOT NULL DEFAULT 'Active',
    Email VARCHAR(255) NOT NULL DEFAULT '' UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL DEFAULT '',
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    Updated TIMESTAMP NOT NULL DEFAULT NOW()
);

-- INSERT INTO Users (Email, PasswordHash) 
-- VALUES ( 'test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');