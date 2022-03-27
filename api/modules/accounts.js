 
/* accounts.js */

import { compare, genSalt, hash } from 'https://deno.land/x/bcrypt@v0.2.4/mod.ts'
import { db } from './db.js'
import {studentHomeSchema} from './schemas.js'
import { create } from "https://deno.land/x/djwt@v2.4/mod.ts";
import Ajv from './ajv.js'
import { verify } from "https://deno.land/x/djwt@v2.4/mod.ts";

const saltRounds = 10
const salt = await genSalt(saltRounds)
const ajv = new Ajv({allErrors: true})

//Creates the key for the JWT token
const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);


export async function login(credentials) {
	const { user, pass } = credentials
	let sql = `SELECT user FROM accounts WHERE user="${user}";`
	let records = await db.query(sql)
	sql = `SELECT pass FROM accounts WHERE user = "${user}";`
	records = await db.query(sql)
	const valid = await compare(pass, records[0].pass)
	if(valid === false) throw new Error(`invalid password for account "${user}"`)
	return user
}

export async function loginJWT(credentials, context) {
	const { user, pass } = credentials
	let sql = `SELECT user FROM accounts WHERE user="${user}";`
	let records = await db.query(sql)
	sql = `SELECT pass FROM accounts WHERE user = "${user}";`
	records = await db.query(sql)
	const valid = await compare(pass, records[0].pass)
	if(valid) {
		const jwt = await create({ alg: "HS512", typ: "JWT" }, { username: user }, key);
		if (jwt) {
			const newBody= {
				username: user,
				jwt
			}
			return newBody
		} else {
			const newBody = {
				message: "Internal server error"
			}
		}
	}
	if(valid === false) {
		const newBody = 
		{
			message: `invalid password for account "${user}"`
		}
	}
	return newBody
}

export async function register(credentials) {
	credentials.pass = await hash(credentials.pass, salt)
	try {
		let sql = `INSERT INTO accounts(user, pass, userType, isAdmin) VALUES("${credentials.user}", "${credentials.pass}", "${credentials.userType}", "${credentials.isAdmin}")`
		console.log("Pre if statement sql: " + sql)
		await db.query(sql)
		if (credentials.userType == "student")
		{
			sql = `CREATE TABLE IF NOT EXISTS ${credentials.user}(
			contentID INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			testDone VARCHAR(5),
			contentOpened VARCHAR(5),
			answerCorrect VARCHAR(5)
			);`
			addContentToStudentRows(credentials.user)
		} else if (credentials.userType == "teacher")
		{
			sql = `CREATE TABLE IF NOT EXISTS ${credentials.user}(
			contentID INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			editted VARCHAR(5)
			);`
		} else throw new Error("Invalid user type - must be student or teacher")
		console.log("Post if statement sql : " + sql)
		await db.query(sql)
	} catch(err) {
		console.log(err)
	}
	return true
}

async function addAllCurrentContent(username)
{
	let sql = "SELECT * FROM content"
	const content = await db.query(sql)
	const nOfRows = content.length
	for (var _ = 0; _ < nOfRows; _++)
	{
		sql = `INSERT INTO ${username}(testDone, contentOpened, answerCorrect)
		VALUES("false", "false", "false")`
		await db.query(sql)
	}
}

async function homeTeacher(account) {
	let sql = `SELECT * FROM content WHERE teacher = "${account.user}"`
	let allContent = await db.query(sql)
	let contentJsonList = []
	let passrate = ""
	for (var content of allContent) {
		if (content.NOAs > 0) {
			passrate = content.NOCAQs/content.NOAs * 100
			passrate = passrate.toString() + "%"
		}
		else 
		{
			passrate = "No one has answered this"
		}
		let contentJson = {
			title: content.title,
			views: content.views,
			questionAttempts: content.NOAs,
			passrate: `${passrate}`
		}
		contentJsonList.push(contentJson)
	}
	const homeData = {
		user: `${account.user}`,
		content: contentJsonList
	}
	return homeData
}
async function homeStudent(account) {
	//required data should be pulled from the user's personal table, as well as the content table.
	//THE BELOW THREE LINES COULD PROBABLY BE WRITTEN IN A FOR LOOP
	let sql = `SELECT COUNT(*) as countValue from ${account.user} WHERE contentOpened = "true"`
	const openedCount = await db.query(sql)

	sql = `SELECT COUNT(*) as countValue from ${account.user} WHERE testDone = "true"`
	const testDoneCount = await db.query(sql)

	sql = `SELECT COUNT(*) as countValue from ${account.user} WHERE answerCorrect = "true"`
	const correctAnswerCount = await db.query(sql)

	sql = `SELECT * FROM content`
	const allContent = await db.query(sql)
	let contentJsonList = []
	//after that look at the home teacher function, and finally look at what other requests you need.
	for (var content of allContent) {
		sql = `SELECT contentOpened from ${account.user} where contentID = ${content.id}`
		let accessed = await db.query(sql)
		console.log(accessed)
		let contentJson = {
			id: content.id,
			title: content.title,
			date: content.curDate,
			teacherName: content.teacher,
			accessed: accessed[0].contentOpened
		}
		contentJsonList.push(contentJson)
	}
	let averageScoreString = ""
	if (testDoneCount[0].countValue > 0)
	{
		let averageScore = correctAnswerCount[0].countValue/testDoneCount[0].countValue
		averageScoreString = (averageScore * 100).toString() + "%"
	} else averageScoreString = "No tests completed"
	const homeData = {
		username: account.user,
		contentViewedCount: openedCount[0].countValue,
		numberOfTestsAttempted: testDoneCount[0].countValue,
		averageScore: `${averageScoreString}`,
		content: contentJsonList
		}
	return homeData
}

export async function getHomeData(user) {
	let sql = `SELECT * FROM accounts WHERE user = "${user}";`
	const accounts = await db.query(sql)
	const account = accounts[0]
	let homeData = {message: "unknown account type making request"}
	if (account.userType === "student") {
		homeData = homeStudent(account)
		//Checking against schema
		const validate = ajv.compile(studentHomeSchema)
		const valid = validate(homeData)
		if (!valid) console.log("Data pulled does not match the student home data schema. Validation error: " + validate.errors)
	} else if (account.userType == "teacher") {
		//required data should be pulled from the user's personal table, as well as the content table.
		homeData = homeTeacher(account)
	}
	return homeData
}

export async function postContent(content) {
	const sql = `INSERT INTO content(teacher, title, imageUrl, curDate, views, question, NOCAQs, NOAs, questionText, questionImageUrl, correctA, inCAOne, inCATwo, inCAThree)
	VALUES("${content.teacher}", "${content.title}", "${content.imageUrl}", "${content.curDate}", ${content.views}, "${content.question}", ${content.NOCAQs}, ${content.NOAs}, "${content.questionText}", "${content.questionImageUrl}", "${content.correctA}", "${content.inCAOne}", "${content.inCATwo}", "${content.inCAThree}");`
	console.log(sql)
	await db.query(sql)
	//below is for if I decide to make content ids not incremental (might be pointless)
	//sql = "SELECT id FROM content ORDER BY id DESC LIMIT 1"
	//const latestId = await db.query(sql)
	addContentToStudentRows()
	return true
}

export async function addContentToStudentRows()
{
	//everytime a piece of content is added
	//each student table must have viewed, testdone, and answercorrect set to false by default.
	let sql = `SELECT user FROM accounts WHERE userType = "student"`
	const usernames = await db.query(sql)
	for (var username of usernames)
	{
		console.log(username)
		sql = `INSERT INTO ${username.user}(testDone, contentOpened, answerCorrect)
		VALUES("false", "false", "false")`
		await db.query(sql)
	}
}

export async function getContentData(contentId)
{
	const sql = `SELECT * FROM content WHERE id = ${contentId}`
	const response = await db.query(sql)
	const contentData = response[0]
	const contentJson = 
	{
    "teacher": contentData.teacher,
    "title": contentData.title,
    "imageUrl": contentData.imageUrl,
    "curDate": contentData.curDate,
    "views": contentData.views,
    "question": contentData.question,
    "NOCAQs": contentData.NOCAQs,
    "NOAs": contentData.NOAs,
    "questionText": contentData.questionText,
    "questionImageUrl": contentData.questionImageUrl,
    "correctA": contentData.correctA,
    "inCAOne": contentData.inCAOne,
    "inCATwo": contentData.inCATwo,
    "inCAThree": contentData.inCAThree
	}
	return contentJson
}

export async function verifyJWT(jwt)
{
	try {
		const payload = await verify(jwt, key);
		const user = payload.username
		const sql = `SELECT * FROM accounts WHERE user = "${user}";`
		console.log(sql)
		const results = await db.query(sql)
		console.log(results)
		if (results[0].user.length > 0) {
			console.log("returning user " + results.user)
			return results[0].user
		}
		else return "No account found with these JWT credentials"
	} catch(err)
	{
		return err.message
	}
	
}