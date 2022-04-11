
/* home.js */

import { customiseNavbar, loadPage } from '../util.js'

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
	var userType = "student"
	const url = "https://partner-parent-8080.codio-box.uk/api/homepage"
	const options = {
		methods: "GET",
		headers: 
		{
			'Content-Type': "application/vnd.api+json",
			'Authorization': "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRoZXN0dWRlbnQiLCJleHAiOjE2NDk2OTM5NjF9.5gXc2GPBECmCyfADlAMVlweUMAIDLayo3dFu6CN0WuXnW1wSfh9w4WCYPlwPHz3iMWcGNtGa0ztUoBR76R5Awg",
			'Accept': 'application/vnd.api+json'
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
		let fragLink = fragment.querySelector('a#viewContent')
		let link = `content-id=${index+1}`
		fragLink.setAttribute('href', link)
		fragLink.addEventListener('click', event => {
			event.preventDefault()
			loadPage(link)
		})
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
		let fragLink = fragment.querySelector('a#viewContent')
		let link = `content-id=${index+1}`
		fragLink.setAttribute('href', link)
		fragLink.addEventListener('click', event => {
			event.preventDefault()
			loadPage(link)
		})
		node.appendChild(fragment)
	}
}


async function goToAddContent()
{
	console.log("changed page to add content")
}
