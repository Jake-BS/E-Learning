
/* home.js */

import { customiseNavbar, loadPage } from '../util.js'

export async function setup(node) {
	console.log('HOME: setup')
	try {
		console.log(node)
		document.querySelector('header p').innerText = 'All about Git'
		customiseNavbar(['home', 'foo', 'logout']) // navbar if logged in
		const token = localStorage.getItem('authorization')
		if(token === null) customiseNavbar(['home', 'register', 'login']) //navbar if logged out
		// add content to the page
		await addContent(node)
	} catch(err) {
		console.error(err)
	}
}

// this example loads the data from a JSON file stored in the uploads directory
async function addContent(node) {
	var userType = localStorage.getItem('userType')
	const url = "https://partner-parent-8080.codio-box.uk/api/homepage"
	const token = localStorage.getItem('authorization')
	const options = {
		methods: "GET",
		headers: 
		{
			'Content-Type': "application/vnd.api+json",
			'Authorization': `Bearer ${token}`,
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
		await homeTeacher(res, node)
	}
}

async function homeStudent(res, node)
{
	let template = document.querySelector('template#contentPreviewTemplate')
	for(var [index, contentJson] of (res.content).entries()) {
		//console.log(contentJson.title)
		let fragment = template.content.cloneNode(true)
		fragment.querySelector('h2').innerText = "Title: " + contentJson.title
		console.log(fragment.querySelector('h2').innerText)
		fragment.querySelector('p#one').innerText = "Teacher: " + contentJson.teacherName
		console.log(fragment.querySelector('p#one').innerText)
		fragment.querySelector('p#two').innerText = "Date created: " + contentJson.date
		console.log(fragment.querySelector('p#two').innerText)
		fragment.querySelector('p#three').innerText = "Opened: " + contentJson.accessed
		console.log(fragment.querySelector('p#three').innerText)
		fragment.querySelector('p#four').innerText = "Question Answered: " + contentJson.questionAnswered
		if (contentJson.questionAnswered == "true") fragment.querySelector('p#five').innerText = "Question Correct: " + contentJson.answerCorrect
		let fragLink = fragment.querySelector('a#viewContent')
		let link = `content-id=${index+1}`
		fragLink.setAttribute('href', link)
		fragLink.addEventListener('click', event => {
			event.preventDefault()
			loadPage(link)
		})
		node.appendChild(fragment)
	}
	let statsTitle = document.createElement("h2")
	statsTitle.innerText = "Student Stats:"
	node.appendChild(statsTitle)
	let viewedP = document.createElement("p")
	viewedP.innerText = "Number of Learning Materials Viewed: " + res.contentViewedCount
	node.appendChild(viewedP)
	let testsAttemptedP = document.createElement("p")
	testsAttemptedP.innerText = "Number of Tests Attempted: " + res.numberOfTestsAttempted
	node.appendChild(testsAttemptedP)
	let averageScoreP = document.createElement("p")
	averageScoreP.innerText = "Average Test Score: " + res.averageScore
	node.appendChild(averageScoreP)
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
		let link = `content-id=${contentJson.id}`
		fragLink.setAttribute('href', link)
		fragLink.addEventListener('click', event => {
			event.preventDefault()
			loadPage(link)
		})
		let qButton = document.createElement('button')
		console.log(contentJson.questionText)
		qButton.innerText = "Edit Question"
		
		let buttonLink = `addQuestion-id=${contentJson.id}`
		qButton.addEventListener('click', event => {
			event.preventDefault()
			loadPage(buttonLink)
		})
		fragment.appendChild(qButton)
		node.appendChild(fragment)
	}
	let button = document.createElement('button')
		button.innerText= "Add Content"
		button.addEventListener('click', event => {
			event.preventDefault()
			loadPage("uploadContent")
		})
	node.appendChild(button)

}


async function goToAddContent()
{
	console.log("changed page to add content")
}
