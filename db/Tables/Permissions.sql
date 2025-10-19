DROP TABLE IF EXISTS Permissions;
CREATE TABLE Permissions (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Permission_name VARCHAR(50) NOT NULL DEFAULT '',
    UserId UUID REFERENCES Users(Id),
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    Updated TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(Permission_name, UserId)
);

select * from permissions;