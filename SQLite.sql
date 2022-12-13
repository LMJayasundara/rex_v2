CREATE TABLE Users (
    User_Name varchar(255) NOT NULL,
    User_Password varchar(255) NOT NULL,
    User_Role varchar(255) NOT NULL,
    PRIMARY KEY (User_Name)
);

INSERT INTO Users (User_Name, User_Password, User_Role)
VALUES ('admin', '123', 'admin');

INSERT INTO Users (User_Name, User_Password, User_Role)
VALUES ('shan', '123', 'admin');

-- DROP TABLE Users;