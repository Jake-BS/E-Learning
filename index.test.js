import { superoak } from 'https://deno.land/x/superoak@4.7.0/mod.ts'
import app from './index.js'

//This is an example from the 'REST Web APIs' lab
//Relearn and create your own.
Deno.test('make a POST request with headers', async () => {
	const request = await superoak(app)
	const data = {
		foo: 'bar'
	}
	const response = await request.post('/')
		.set('Content-Type', 'application/json')
		.send(JSON.stringify(data))
	console.log(response.body)
})