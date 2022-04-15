
/* router.js */

import { highlightNav,  triggerPageChange, customiseNavbar } from './util.js'

window.addEventListener('popstate', triggerPageChange)

document.querySelectorAll('nav a').forEach(element => element.addEventListener('click', router))
document.querySelectorAll('a').forEach(element => element.addEventListener('click', router))

let token = localStorage.getItem('authorization')
console.log("This is the token" + token)
if(token === null) customiseNavbar(['register', 'login']) //navbar if logged out
else customiseNavbar(['home', 'logout']) //navbar if logged out

router()

async function router(event) {
	if(event) { // has this been triggered by the click event?
		event.preventDefault()
		history.pushState(null, null, event.target.href)
	}
	try {
		await triggerPageChange()
	} catch(err) {
		console.log(err)
	}
}
