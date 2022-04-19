
/* routes.js */

import { Router, Status } from 'https://deno.land/x/oak@v6.5.1/mod.ts'

import { extractCredentials, saveFile } from './modules/util.js'
import { login, loginJWT, register, getHomeData, postContent, getContentData, verifyJWT, getType, viewContent, answerQuestion, addQuestion } from './modules/accounts.js'
import { Client } from 'https://deno.land/x/mysql/mod.ts'
import {answerQuestionSchema, questionSchema, postContentSchema} from './modules/schemas.js'
import Ajv from './modules/ajv.js'
const ajv = new Ajv({allErrors: true})


const router = new Router()

// the routes defined here
//Only admin should access route
router.get('/', async context => {
	console.log('GET /')
	const data = await Deno.readTextFile('spa/index.html')
	context.response.body = data
})

//HATEOAS
router.get('/api/', async context =>{
	try {
		context.response.headers.set("Allow", 'GET')
		const data = {
			name: 'E-Learning API',
			desc: 'A REST API to provide the backend for a Git E-Learning website',
			links: [
				{
					name: 'login',
					desc: 'GET to provide user with jwt token to access other API routes/resources',
					href: `/api/account`,
				},
				{
					name: 'register',
					desc: 'POST to register a new account',
					href: `/api/register`,
				},
				{
					name: 'homepage',
					desc: 'GET to recieve resource for the homepage',
					href: `/api/homepage`,
				},
				{
					name: 'content with id',
					desc: 'GET to recieve resource for a specific piece of content based on id given at the end of URL',
					href: `/api/content/replacethiswithid`,
				},
				{
					name: 'create content',
					desc: 'POST as a teacher to create a piece of content',
					href: `/api/content`,
				},
    	        {
					name: 'answer question with appropriate contentid',
					desc: 'POST to answer the question of a piece of content',
					href: `/api/answer/replacethiswithid`,
				},
    	        {
					name: 'add question to content',
					desc: 'POST as a teacher to add a question to a piece of content',
					href: `/api/question/replacethiswithid`,
				}

		]
		}
		context.status = Status.OK
		context.response.body = JSON.stringify(data, null, 2)
	} catch(err)
	{
		console.log(err)
	}
})
//All roles
router.get('/api/accounts', async context => {
	console.log('GET /api/accounts')
	const token = context.request.headers.get('Authorization')
	console.log(`auth: ${token}`)
	try {
		const credentials = extractCredentials(token)
		console.log(credentials)
		const newBody = await loginJWT(credentials, context)
		context.response.body = newBody
		context.status = Status.OK
		if (newBody == "unauthorized")
		{
			context.response.body = JSON.stringify({ status: 'Unauthorized', msg: 'The account cannot be found in our database and so we cannot give you a jwt token' })
			context.response.status = 401
		}
	} catch(err) {
		context.response.body = JSON.stringify({ status: 'failure', msg: 'An unexpected internal server error has occured' })
		context.response.status = 500
	}
})

//everyone should be able to access this
//Maybe a minute of cache incase some new content is posted
router.get('/api/homepage', async context => {
	context.response.headers.set('Allow', 'GET')
	try {
		const token = context.request.headers.get('Authorization')
		const jwt = token.split(' ')[1]
		const validUser = await verifyJWT(jwt)
		if (validUser.substring(0, 6)== "Caught") 
		{
			context.response.body = JSON.stringify({ status: 'Unauthorized', msg: 'JWT token invalid or expired' })
			context.response.status = 401
		} else {
			const accountHomeData = await getHomeData(validUser)
			//the below line is currently hard coded but should depend on what type the user id is associated with in the db.
			context.status = Status.OK
			context.response.body = JSON.stringify(accountHomeData, null, 2)
		}
		
	} catch(err) {
		console.log(err)
		context.response.body = JSON.stringify({ status: 'failure', msg: 'An unexpected internal server error has occured' })
		context.response.status = 500
	}
	
})

router.get('/api/content/:id', async context => {
	context.response.headers.set('Allow', 'GET, PUT, DELETE')
	try {
		const token = context.request.headers.get('Authorization')
		const jwt = token.split(' ')[1]
		const validUser = await verifyJWT(jwt)
		console.log(validUser)
		if (validUser.substring(0, 6)== "Caught")
		{
			context.response.body = JSON.stringify({ status: 'Unauthorized', msg: 'JWT token invalid or expired' })
			context.response.status = 401
		} else {
			const contentData = await getContentData(context.params.id, validUser)
			const viewed = await viewContent(context.params.id, validUser)
			if (viewed) console.log("Content has been viewed")
			//the below line is currently hard coded but should depend on what type the user id is associated with in the db.
			context.status = Status.OK
			context.response.body = JSON.stringify(contentData, null, 2)
			if (contentData == "none")
			{
				context.response.status = 404
				context.response.body = JSON.stringify({ status: 'Not Found', msg: 'This piece of content does not exist' })
			}
		}
		
	} catch(err) {
		console.log(err)
		context.response.body = JSON.stringify({ status: 'failure', msg: 'An unexpected internal server error has occured' })
		context.response.status = 500
	}
	
})


//anyone should be able to create an account
router.post('/api/register', async context => {
	console.log('POST /api/register')
	const token = context.request.headers.get('Authorization')
	console.log(`auth: ${token}`)
	try {
		const credentials = extractCredentials(token)
		const body  = await context.request.body()
		const bodyData = await body.value
		const data = 
		{
			user: credentials.user,
			pass: credentials.pass,
			userType: bodyData.userType,
			isAdmin: bodyData.isAdmin
		}
		console.log(data)
		await register(data)
		context.response.status = 201
		context.response.body = JSON.stringify({ status: 'Created', msg: 'account created' })
	} catch(err) {
		console.log(err)
		context.response.body = JSON.stringify({ status: 'failure', msg: 'An unexpected internal server error has occured' })
		context.response.status = 500
	}
	
})

router.post('/api/content', async context => {
	try {
		console.log('POST /api/content')
		const token = context.request.headers.get('Authorization')
		const jwt = token.split(' ')[1]
		const validUser = await verifyJWT(jwt)
		console.log(validUser)
		if (validUser.substring(0, 6)== "Caught")
		{
			context.response.body = JSON.stringify({ status: 'Unauthorized', msg: 'JWT token invalid or expired' })
			context.response.status = 401
		} else
		{
			const body  = await context.request.body()
			const data = await body.value
			console.log(data.value)
			const validate = ajv.compile(postContentSchema)
			const valid = validate(data)
			if (!valid)
			{
				context.response.body = JSON.stringify({ status: 'Bad Request', msg: `Data sent does not match the content schema, only fields should be text, title, and imageUrl. All fields are strings` })
				context.response.status = 400
			} else{
				const postResult = await postContent(data, validUser)
				if (postResult == true)
				{
					context.response.status = 201
					context.response.body = JSON.stringify({ status: 'Created', msg: 'content created' })
				}
				else 
				{
					context.response.status = 403
					context.response.body = JSON.stringify({ status: 'Forbidden', msg: 'You must be a teacher to post content' })
				}
			}
			
		}
	} catch(err) {
		console.log(err)
		context.response.body = JSON.stringify({ status: 'failure', msg: 'An unexpected internal server error has occured' })
		context.response.status = 500
	}
})

router.post('/api/question/:id', async context => {
	try {
		const token = context.request.headers.get('Authorization')
		const jwt = token.split(' ')[1]
		const validUser = await verifyJWT(jwt)
		console.log(validUser)
		if (validUser.substring(0, 6)== "Caught")
		{
			context.response.body = JSON.stringify({ status: 'Unauthorized', msg: 'JWT token invalid or expired' })
			context.response.status = 401
		} else
		{
			console.log('POST /api/answer')
			const body  = await context.request.body()
			const data = await body.value
			const validate = ajv.compile(questionSchema)
			const valid = validate(data)
			console.log(validUser + " adding question to content " + context.params.id)
			if (!valid) 
			{
				context.response.body = JSON.stringify({ status: 'Bad Request', msg: `Data sent does not match the question schema, only fields should be questionText, questionImageUrl, correctA, inCAOne, inCATwo, inCAThree. All fields are strings` })
				context.response.status = 400
			}
			else 
			{
				const response = await addQuestion(context.params.id, validUser, data)
				if (response == "added") {
				context.response.status = 201
				context.response.body = JSON.stringify({ status: 'success', msg: 'Question added', links: { content: `/content/${context.params.id}`} })
				}
				else if (response == "unauthorized") 
				{
					context.response.body = JSON.stringify({ status: 'Forbidden', msg: 'Only the content teacher may add a question' })
					context.response.status = 403
				}
			}
		}
	} catch(err) {
		console.log(err)
		context.response.body = JSON.stringify({ status: 'failure', msg: 'An unexpected internal server error has occured' })
		context.response.status = 500
	}
})

router.post('/api/answer/:id', async context => {
	try {
		const token = context.request.headers.get('Authorization')
		const jwt = token.split(' ')[1]
		const validUser = await verifyJWT(jwt)
		console.log(validUser)
		if (validUser.substring(0, 6)== "Caught")
		{
			context.response.body = JSON.stringify({ status: 'Unauthorized', msg: 'JWT token invalid or expired' })
			context.response.status = 401
		} else
		{
			console.log('POST /api/answer')
			const body  = await context.request.body()
			const data = await body.value
			const validate = ajv.compile(answerQuestionSchema)
			const valid = validate(data)
			if (!valid) 
			{
				context.response.body = JSON.stringify({ status: 'Bad Request', msg: `Data sent does not match the answer schema, please format like {answer: Your answer}` })
				context.response.status = 400
			}
			else 
			{
				console.log(validUser + " answering question " + context.params.id + " with " + data.answer)
				const response = await answerQuestion(context.params.id, validUser, data.answer)
				if (response == "answered") {
				context.response.status = 201
				context.response.body = JSON.stringify({ status: 'Created', msg: 'Question answered', links: { content: `/content/${context.params.id}`} })
				}
				else if (response == "previously") 
				{
					context.response.body = JSON.stringify({ status: 'Bad Request', msg: 'Question already answered' })
					context.response.status = 400
				} else if(response == "noQ")
				{
					context.response.body = JSON.stringify({ status: 'Not Found', msg: 'There is no question for this piece of content' })
					context.response.status = 404
				} else if (response=="teacher")
				{
					context.response.body = JSON.stringify({ status: 'Forbidden', msg: 'Teachers may not answer questions' })
					context.response.status = 403
				}
			}
		}
	} catch(err) {
		console.log(err)
		context.response.body = JSON.stringify({ status: 'failure', msg: 'An unexpected internal server error has occured' })
		context.response.status = 500
	}
})

//perhaps just admin
/*router.post('/api/files', async context => {
	console.log('POST /api/files')
	try {
		const token = context.request.headers.get('Authorization')
		const jwt = token.split(' ')[1]
		const validUser = await verifyJWT(jwt)
		console.log(validUser)
		if (validUser.substring(0, 6)== "Caught")
		{
			context.response.body = JSON.stringify({ status: 'failure', msg: 'JWT token invalid or expired' })
			context.response.status = 401
		}
		else {
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
		}
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
})*/


router.get("/(.*)", async context => {      
	try {
		context.response.headers.set("Allow", 'GET')
		const data = {
			status: 'Not Found',
			name: 'E-Learning API',
			desc: 'A REST API to provide the backend for a Git E-Learning website',
			links: [
				{
					name: 'login',
					desc: 'GET to provide user with jwt token to access other API routes/resources',
					href: `/api/account`,
				},
				{
					name: 'register',
					desc: 'POST to register a new account',
					href: `/api/register`,
				},
				{
					name: 'homepage',
					desc: 'GET to recieve resource for the homepage',
					href: `/api/homepage`,
				},
				{
					name: 'content with id',
					desc: 'GET to recieve resource for a specific piece of content based on id given at the end of URL',
					href: `/api/content/replacethiswithid`,
				},
				{
					name: 'create content',
					desc: 'POST as a teacher to create a piece of content',
					href: `/api/content`,
				},
    	        {
					name: 'answer question with appropriate contentid',
					desc: 'POST to answer the question of a piece of content',
					href: `/api/answer/replacethiswithid`,
				},
    	        {
					name: 'add question to content',
					desc: 'POST as a teacher to add a question to a piece of content',
					href: `/api/question/replacethiswithid`,
				}

		]
		}
		context.status = 404
		context.response.body = JSON.stringify(data, null, 2)
	} catch(err)
	{
		console.log(err)
	}
})

export default router

