/* addQuestion.js */

import { customiseNavbar, file2DataURI, loadPage, secureGet, showMessage } from '../util.js'

export async function setup(node, queryString) {
	console.log("this is the node: " + node)
	try {
		console.log(node)
		document.querySelector('header p').innerText = 'Add a question!'
		customiseNavbar(['home', 'logout']) // navbar if logged in
		let token = localStorage.getItem('authorization')
		token = `Bearer ${token}`
		console.log(token)
		if(token === null) customiseNavbar(['home', 'logout']) //navbar if logged out
		// add content to the page
        node.querySelector('form').addEventListener('submit', async event => 
		{
			await addQuestion(queryString, event)
		})
	} catch(err) {
		console.error(err)
	}
}

async function addQuestion(queryString, event)
{
	event.preventDefault()
	//Auth section
	let token = localStorage.getItem('authorization')
	token = `Bearer ${token}`
	//form data
    const formData = new FormData(event.target)
	const data = Object.fromEntries(formData.entries())
	//image to base64 section
	const element = document.querySelector('input[name="questionImageUrl"]')
	console.log(element)
	const file = document.querySelector('input[name="questionImageUrl"]').files[0]
	const base64 = await file2DataURI(file)

    let url = `https://partner-parent-8080.codio-box.uk/api/question/${queryString.id}`
	let theBody = {
				"questionText": data.questionText,
				"correctA": data.correctA,
                "inCAOne": data.inCAOne,
                "inCATwo": data.inCATwo,
                "inCAThree": data.inCAThree,
				"questionImageUrl": base64
			}
	console.log(JSON.stringify(theBody))
    const options = {
			method: 'POST',
			headers: { 
                'Content-Type': 'application/vnd.api+json',
                'Authorization' : token
            },
			body: JSON.stringify(theBody)
			
		}
    const response = await fetch(url, options)
	const jsonResponse = await response.json()
	console.log(jsonResponse)
    showMessage("Question added!")
    await loadPage('home')
}