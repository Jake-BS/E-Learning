
/* home.js */

import { customiseNavbar } from '../util.js'

export async function setup(node) {
	console.log('HOME: setup')
	try {
		console.log(node)
		document.querySelector('header p').innerText = 'All about Git'
		customiseNavbar(['home', 'foo', 'logout']) // navbar if logged in
		const token = localStorage.getItem('authorization')
		console.log(token)
		if(token === null) customiseNavbar(['home', 'register', 'login']) //navbar if logged out
		// add content to the page
		await addContent(node)
	} catch(err) {
		console.error(err)
	}
}

// this example loads the data from a JSON file stored in the uploads directory
async function addContent(node) {
	var userType = "teacher"
	const url = "https://partner-parent-8080.codio-box.uk/api/homepage"
	const options = {
		methods: "GET",
		headers: 
		{
			'Content-Type': "application/vnd.api+json",
			'Authorization': "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlYWNoZXIiLCJleHAiOjE2NDkwMjg5Njd9.ibJJf05qBOhMfU5L70Xb05kLZzU5zJRaK4QeWL_KBiV-KadtFCXgXVQ09zAaDIxXmeu52JWKEDt6c0qR8bhx8Q"
		}
	}
	const response = await fetch(url, options)
	if(!response.ok) throw new Error('unable to make API call')
	const res = await response.json()
	console.log(res)
	if (userType == "student") await homeStudent(res, node)
	else if (userType == "teacher") 
	{
		let button = document.createElement('button')
		button.innerText= "Add Content"
		button.addEventListener('click', async() => goToAddContent())
		const main = document.querySelector('main')
		main.appendChild(button)
		await homeTeacher(res, node)
	}
}

async function homeStudent(res, node)
{
	let template = document.querySelector('template#contentPreviewTemplate')
	for(var [index, contentJson] of (res.content).entries()) {
		//console.log(contentJson.title)
		let fragment = template.content.cloneNode(true)
		fragment.querySelector('h2').innerText = contentJson.title
		console.log(fragment.querySelector('h2').innerText)
		fragment.querySelector('p#one').innerText = contentJson.teacherName
		console.log(fragment.querySelector('p#one').innerText)
		fragment.querySelector('p#two').innerText = contentJson.date
		console.log(fragment.querySelector('p#two').innerText)
		fragment.querySelector('p#three').innerText = contentJson.accessed
		console.log(fragment.querySelector('p#three').innerText)
		fragment.querySelector('a#viewContent').setAttribute('href', `./content/${index+1}`)
		node.appendChild(fragment)
	}
}

async function homeTeacher(res, node)
{
	let template = document.querySelector('template#contentPreviewTemplate')
	for(var [index, contentJson] of (res.content).entries()) {
		//console.log(contentJson.title)
		let fragment = template.content.cloneNode(true)
		fragment.querySelector('h2').innerText = contentJson.title
		console.log(fragment.querySelector('h2').innerText)
		fragment.querySelector('p#one').innerText = "views: " + String(contentJson.views)
		console.log(fragment.querySelector('p#two').innerText)
		fragment.querySelector('p#three').innerText = "attempts: "+ String(contentJson.questionAttempts)
		console.log(fragment.querySelector('p#three').innerText)
		fragment.querySelector('p#four').innerText = "passrate: " + contentJson.passrate
		console.log(fragment.querySelector('p#four').innerText)
		fragment.querySelector('a#viewContent').setAttribute('href', `./content/${index+1}`)
		node.appendChild(fragment)
	}
}


async function goToAddContent()
{
	console.log("changed page to add content")
}
