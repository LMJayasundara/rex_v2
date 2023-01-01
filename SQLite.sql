-- CREATE TABLE Users

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

DROP TABLE Users;

-- CREATE TABLE Files

CREATE TABLE Files (
    File_No varchar(255) NOT NULL,
    Item_Des varchar(255),
    Dra_No varchar(255),
    Dra_Iss varchar(255),
    Jig_Sts varchar(255),
    saved int default 0,
    len int default null,
    md int default null,
    mark int default null,
    turn int default null,
    adj int default null,
    kk int default null,
    PRIMARY KEY (File_No)
);

INSERT INTO Files (File_No, Item_Des, Dra_No, Dra_Iss, Jig_Sts)
VALUES ('BCM0001', 'Long Mesh Cord', 'D001', 'ISS001', 'Work');

DROP TABLE Files;

-- Drop TABLES 

DROP TABLE BCM0001;
DROP TABLE BCM0002;