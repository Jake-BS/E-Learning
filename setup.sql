
-- make sure the websiteuser account is set up and has the correct privileges
CREATE USER IF NOT EXISTS websiteuser IDENTIFIED BY 'websitepassword';
GRANT INSERT, SELECT, UPDATE, DELETE ON website.* TO websiteuser;

DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS content;
DROP TABLE IF EXISTS doej;

CREATE TABLE IF NOT EXISTS accounts (
  user VARCHAR(15) NOT NULL PRIMARY KEY,
  pass VARCHAR(500) NOT NULL,
  userType VARCHAR(7) NOT NULL,
  isAdmin VARCHAR(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS content (
  id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher VARCHAR(15) NOT NULL,
  title VARCHAR(100) NOT NULL,
  imageUrl VARCHAR(500) NOT NULL,
  curDate CHAR(17) NOT NULL,
  views INTEGER NOT NULL,
  question VARCHAR(200) NOT NULL,
  NOCAQs INTEGER NOT NULL,
  NOAs INTEGER NOT NULL,
  questionText VARCHAR(500) NOT NULL,
  questionImageURL VARCHAR(500) NOT NULL,
  correctA VARCHAR(100) NOT NULL,
  inCAOne VARCHAR(100) NOT NULL,
  inCATwo VARCHAR(100) NOT NULL,
  inCAThree VARCHAR(100) NOT NULL
);

INSERT INTO accounts(user, pass, userType, isAdmin)
	VALUES("doej", "$2b$10$gL33obKAFUT5DK3pEbh72OIHztsWBniBBh.PdeKOrF1yr5KFAsdZO", "student", "true");

CREATE TABLE IF NOT EXISTS doej(
	contentID INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	testDone VARCHAR(5),
	contentOpened VARCHAR(5),
	answerCorrect VARCHAR(5)
);

INSERT INTO doej(testDone, contentOpened, answerCorrect)
	VALUES("false", "true", "false");
INSERT INTO doej(testDone, contentOpened, answerCorrect)
	VALUES("true", "true", "false");
INSERT INTO doej(testDone, contentOpened, answerCorrect)
	VALUES("true", "true", "true");