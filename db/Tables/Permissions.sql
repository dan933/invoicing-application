DROP TABLE IF EXISTS permissions;
CREATE TABLE permissions (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name VARCHAR(50) NOT NULL DEFAULT '',
    user_id UUID REFERENCES Users(Id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(Permission_name, user_id)
);