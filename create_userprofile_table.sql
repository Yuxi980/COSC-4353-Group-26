CREATE DATABASE IF NOT EXISTS user_profile_db;
USE user_profile_db;


CREATE TABLE IF NOT EXISTS UserProfile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state CHAR(2) NOT NULL,
    zipCode VARCHAR(9) NOT NULL,
    skills TEXT NOT NULL,
    preferences TEXT,
    availability TEXT NOT NULL
);
