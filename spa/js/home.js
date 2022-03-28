
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
	const url = "https://partner-parent-8080.codio-box.uk/api/homepage"
	const options = {
		methods: "GET",
		headers: 
		{
			'Content-Type': "application/vnd.api+json",
			'Authorization': "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRvZWoiLCJleHAiOjE2NDg0NjMxMDh9.ga_VXOohHMFP83OdwiAfrjz1sfuh_hP1Av4MDEWHrF1t8OGbcRMDA79REAvTznty4z3FpKJf7Ly8bnDw5R35EA"
		}
	}
	const response = await fetch(url, options)
	if(!response.ok) throw new Error('unable to make API call')
	const res = await response.json()
	console.log(res)
	let template = document.querySelector('template#contentPreviewTemplate')
	for(var contentJson of res.content) {
		//console.log(contentJson.title)
		let fragment = template.content.cloneNode(true)
		fragment.querySelector('h2').innerText = contentJson.title
		console.log(fragment.querySelector('h2').innerText)
		fragment.querySelector('p#teacherName').innerText = contentJson.teacherName
		console.log(fragment.querySelector('p#teacherName').innerText)
		fragment.querySelector('p#date').innerText = contentJson.date
		console.log(fragment.querySelector('p#date').innerText)
		fragment.querySelector('p#statusIndicator').innerText = contentJson.accessed
		console.log(fragment.querySelector('p#statusIndicator').innerText)
		fragment.querySelector('a#viewContent').setAttribute('href', `./content/${contentJson.id}`)
		node.appendChild(fragment)
	}
	//return node
}

