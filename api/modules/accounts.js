
/* accounts.js */

import { compare, genSalt, hash } from 'https://deno.land/x/bcrypt@v0.2.4/mod.ts'
import { db } from './db.js'

const saltRounds = 10
const salt = await genSalt(saltRounds)

export async function login(credentials) {
	const { user, pass } = credentials
	let sql = `SELECT count(id) AS count FROM accounts WHERE user="${user}";`
	let records = await db.query(sql)
	if(!records[0].count) throw new Error(`username "${user}" not found`)
	sql = `SELECT pass FROM accounts WHERE user = "${user}";`
	records = await db.query(sql)
	sql = `SELECT pass FROM accounts WHERE user = "${user}";`
	const valid = await compare(pass, records[0].pass)
	//sql = `SELECT userType FROM accounts WHERE user = "${user}";`
	//const userType = await db.query(sql)
	//if (userType === "student") getStudent(credentials)
	//else if (userType == "teacher") getTeacher(credentials)
	if(valid === false) throw new Error(`invalid password for account "${user}"`)
	return user
}

export async function register(credentials) {
	credentials.pass = await hash(credentials.pass, salt)
	try {
		const sql = `INSERT INTO accounts(user, pass, userType, isAdmin) VALUES("${credentials.user}", "${credentials.pass}", "${credentials.userType}", "${credentials.isAdmin}")`
		console.log(sql)
		await db.query(sql)
	} catch(err) {
		console.log(err)
	}
	return true
}

//export async function getTeacher(credentials) {}

//export async function getStudent(credentials) {}
