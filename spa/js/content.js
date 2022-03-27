/* home.js */

import { customiseNavbar } from '../util.js'

export async function setup(node) {
	console.log('content: setup')
	try {
		console.log(node)
		document.querySelector('header p').innerText = 'Specific Content Page'
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