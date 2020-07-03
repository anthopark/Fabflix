CREATE DATABASE IF NOT EXISTS moviedbexample;
USE moviedbexample;

CREATE TABLE IF NOT EXISTS stars(
	id varchar(10) primary key,
	name varchar(100) not null,
	birthYear Integer
);


CREATE TABLE IF NOT EXISTS movies(
	id VARCHAR(10) primary key,
	title VARCHAR(100) NOT NULL DEFAULT '',
	year Integer not null,
	director VARCHAR(100) NOT NULL DEFAULT ''
);


CREATE TABLE IF NOT EXISTS stars_in_movies(
	starId VARCHAR(10) NOT NULL DEFAULT '',
	movieId VARCHAR(10) NOT NULL DEFAULT '',
	FOREIGN KEY (starId) REFERENCES stars(id),
	FOREIGN KEY (movieId) REFERENCES movies(id)
);
