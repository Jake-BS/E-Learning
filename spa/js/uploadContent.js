/* uploadContent.js */

import { customiseNavbar, file2DataURI, loadPage, secureGet, showMessage } from '../util.js'

export async function setup(node) {
	console.log("this is the node: " + node)
	try {
		console.log(node)
		document.querySelector('header p').innerText = 'Create some new content!'
		customiseNavbar(['home', 'logout']) // navbar if logged in
		let token = localStorage.getItem('authorization')
		token = `Bearer ${token}`
		console.log(token)
		if(token === null) customiseNavbar(['home', 'logout']) //navbar if logged out
		// add content to the page
        node.querySelector('form').addEventListener('submit', await releaseContent)
	} catch(err) {
		console.error(err)
	}
}

async function releaseContent()
{
	event.preventDefault()
	//Auth section
	let token = localStorage.getItem('authorization')
	token = `Bearer ${token}`
	//form data
    const formData = new FormData(event.target)
	const data = Object.fromEntries(formData.entries())
	//image to base64 section
	const element = document.querySelector('input[name="imageUrl"]')
	console.log(element)
	const file = document.querySelector('input[name="imageUrl"]').files[0]
	let base64 = "None"
	if (file != null)
	{
		base64 = await file2DataURI(file)
	}
	

    let url = `https://partner-parent-8080.codio-box.uk/api/content/`
	let theBody = {
				"text": data.text,
				"title": data.title,
				"imageUrl": base64
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
    showMessage("Content created!")
    await loadPage('home')
}