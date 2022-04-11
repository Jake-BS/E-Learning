/* home.js */

import { customiseNavbar, secureGet } from '../util.js'

export async function setup(node, queryString) {
	console.log("this is the node: " + node)
	try {
		console.log(node)
		document.querySelector('header p').innerText = 'Specific Content Page'
		customiseNavbar(['home', 'foo', 'logout']) // navbar if logged in
		let token = localStorage.getItem('authorization')
		token = `Bearer ${token}`
		console.log(token)
		if(token === null) customiseNavbar(['home', 'register', 'login']) //navbar if logged out
		// add content to the page
		let url = `https://partner-parent-8080.codio-box.uk/api/content/${queryString.id}`
		console.log(url)
		await addContent(node, url, token)
	} catch(err) {
		console.error(err)
	}
}

async function addContent(node, url, token)
{
	const response = await secureGet(url, token)
	const json = response.json
	if (json.questionText == "None") await noQuestion(json, node)
	else await questionExists(json, node)
}

async function questionExists(json, node)
{console.log("There is a question")}

async function noQuestion(json, node)
{
	let template = document.querySelector('template#contentTemplate')
	let fragment = template.content.cloneNode(true)
	fragment.querySelector('h2').innerText = json.title
	console.log(fragment.querySelector('h2').innerText)
	fragment.querySelector('p#text').innerText = json.text
	console.log(json.text)
	node.appendChild(fragment)
}