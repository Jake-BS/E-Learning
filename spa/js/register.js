
/* register.js */

import { customiseNavbar, loadPage, showMessage, createToken } from '../util.js'

export async function setup(node) {
	try {
		console.log('REGISTER: setup')
		console.log(node)
		document.querySelector('header p').innerText = 'Register an Account'
		customiseNavbar(['login'])
		node.querySelector('form').addEventListener('submit', await register)
	} catch(err) { // this will catch any errors in this script
		console.error(err)
	}
}

async function register() {
	event.preventDefault()
	const formData = new FormData(event.target)
	const data = Object.fromEntries(formData.entries())
	console.log(data)
	const url = 'https://partner-parent-8080.codio-box.uk/api/register'
	const token = 'Basic ' + btoa(`${data.user}:${data.pass}`)
	let theBody = {
		"userType" : data.userType,
		"isAdmin": "false"
	}
	const options = {
		method: 'POST',
		headers: {
			'Authorization': token,
			'Content-Type': 'application/vnd.api+json'
		},
		body: JSON.stringify(theBody)
	}
	const response = await fetch(url, options)
	const json = await response.json()
	console.log(json)
	showMessage('new account registered')
	loadPage('login')
}