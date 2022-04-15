/* home.js */

import { customiseNavbar, secureGet } from '../util.js'

export async function setup(node, queryString) {
	console.log("this is the node: " + node)
	try {
		console.log(node)
		document.querySelector('header p').innerText = 'Specific Content Page'
		customiseNavbar(['home','logout']) // navbar if logged in
		let token = localStorage.getItem('authorization')
		token = `Bearer ${token}`
		console.log(token)
		if(token === null) customiseNavbar(['register', 'login']) //navbar if logged out
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
{
	let userType = localStorage.getItem('userType')
	let template = document.querySelector('template#contentTemplateQuestion')
	if (userType=="teacher") template = document.querySelector('template#contentTemplateQuestionTeacher')
	let fragment = template.content.cloneNode(true)
	fragment.querySelector('h2').innerText = json.title
	console.log(fragment.querySelector('h2').innerText)
	fragment.querySelector('pre#text').innerText = json.text
	fragment.querySelector('img#image').setAttribute('src', json.imageUrl)
	if (userType == "teacher")
	{
		fragment.querySelector('p#one').innerText = json.correctA
		fragment.querySelector('p#two').innerText = json.inCAOne
		fragment.querySelector('p#three').innerText = json.inCATwo
		fragment.querySelector('p#four').innerText = json.inCAThree
	}
	else
	{
		fragment.querySelector('p#one').innerText = json.correctA
		fragment.querySelector('p#two').innerText = json.inCAOne
		fragment.querySelector('p#three').innerText = json.inCATwo
		fragment.querySelector('p#four').innerText = json.inCAThree
	}
	console.log(json.text)
	node.appendChild(fragment)
}

async function noQuestion(json, node)
{
	let template = document.querySelector('template#contentTemplate')
	let fragment = template.content.cloneNode(true)
	fragment.querySelector('h2').innerText = json.title
	console.log(fragment.querySelector('h2').innerText)
	fragment.querySelector('pre#text').innerText = json.text
	fragment.querySelector('img#image').setAttribute('src', json.imageUrl)
	console.log(json.text)
	//fragment.querySelector('select#test').setAttribute('hidden')
	node.appendChild(fragment)
}