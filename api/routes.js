
/* routes.js */

import { Router } from 'https://deno.land/x/oak@v6.5.1/mod.ts'

import { extractCredentials, saveFile } from './modules/util.js'
import { login, register, getHomeData, postContent } from './modules/accounts.js'
import { Client } from 'https://deno.land/x/mysql/mod.ts'

const router = new Router()

// the routes defined here
//Only admin should access route
router.get('/', async context => {
	console.log('GET /')
	const data = await Deno.readTextFile('spa/index.html')
	context.response.body = data
})

//All roles
router.get('/api/accounts', async context => {
	console.log('GET /api/accounts')
	const token = context.request.headers.get('Authorization')
	console.log(`auth: ${token}`)
	try {
		const credentials = extractCredentials(token)
		console.log(credentials)
		const username = await login(credentials)
		console.log(`username: ${username}`)
		context.response.body = JSON.stringify(
			{
				data: { username }
			}, null, 2)
	} catch(err) {
		context.response.status = 401
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '401 Unauthorized.',
						detail: err.message
					}
				]
			}
		, null, 2)
	}
})

//teachers and admins should be able to access this
router.get('/api/accounts/:username', async context => {
	context.response.headers.set('Allow', 'GET, PUT, DELETE')
	try {
		const accountHomeData = await getHomeData(context.params.username)
		//the below line is currently hard coded but should depend on what type the user id is associated with in the db.
		context.response.status = 200
		context.response.body = JSON.stringify(accountHomeData, null, 2)
	} catch(err) {
		console.log(err)
		context.response.status = 400
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: 'a problem occurred',
						detail: err.message
					}
				]
			}
		)
	}
	
})


//anyone should be able to create an account
router.post('/api/accounts', async context => {
	console.log('POST /api/accounts')
	const body  = await context.request.body()
	const data = await body.value
	console.log(data)
	await register(data)
	context.response.status = 201
	context.response.body = JSON.stringify({ status: 'success', msg: 'account created' })
})

router.post('/api/content', async context => {
	try {
		console.log('POST /api/content')
		const body  = await context.request.body()
		const data = await body.value
		console.log(data)
		await postContent(data)
		context.response.status = 201
		context.response.body = JSON.stringify({ status: 'success', msg: 'content created' })
	} catch(err) {
		console.log(err)
	}
})

//perhaps just admin
router.post('/api/files', async context => {
	console.log('POST /api/files')
	try {
		const token = context.request.headers.get('Authorization')
		console.log(`auth: ${token}`)
		const body  = await context.request.body()
		const data = await body.value
		console.log(data)
		saveFile(data.base64, data.user)
		context.response.status = 201
		context.response.body = JSON.stringify(
			{
				data: {
					message: 'file uploaded'
				}
			}
		)
	} catch(err) {
		context.response.status = 400
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: 'a problem occurred',
						detail: err.message
					}
				]
			}
		)
	}
})


router.get("/(.*)", async context => {      
// 	const data = await Deno.readTextFile('static/404.html')
// 	context.response.body = data
	const data = await Deno.readTextFile('spa/index.html')
	context.response.body = data
})

export default router

