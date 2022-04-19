/* home.js */

import { customiseNavbar, secureGet, showMessage } from '../util.js'

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
		await addContent(node, url, token, queryString)
	} catch(err) {
		console.error(err)
	}
}

async function addContent(node, url, token, queryString)
{
	const response = await secureGet(url, token)
	const json = response.json
	if (json.questionText == "None") await noQuestion(json, node)
	else await questionExists(json, node, queryString)
}


async function questionExists(json, node, queryString)
{
	let userType = localStorage.getItem('userType')
	let template = document.querySelector('template#contentTemplateQuestion')
	if (userType=="teacher") template = document.querySelector('template#contentTemplateQuestionTeacher')
	let fragment = template.content.cloneNode(true)
	fragment.querySelector('h2').innerText = json.title
	const converter = new showdown.Converter({'tables': true, 'tasklists': true, 'strikethrough': true})
    const html = converter.makeHtml(json.text)
	console.log(json.text)
	//console.log(html)
	fragment.querySelector('pre#text').innerHTML = html
	console.log("Imageurl - " + json.imageUrl)
	if (json.imageUrl != "None") fragment.querySelector('img#image').setAttribute('src', json.imageUrl)
	else
	{
		let imageHolder = fragment.querySelector('img#image')
		imageHolder.remove()
	}
	const questionHtml = converter.makeHtml(json.questionText)
	fragment.querySelector('pre#questionText').innerHTML = questionHtml
	fragment.querySelector('img#questionImage').setAttribute('src', json.questionImageUrl)
	if (userType == "teacher")
	{
		fragment.querySelector('p#one').innerText = json.correctA
		fragment.querySelector('p#two').innerText = json.inCAOne
		fragment.querySelector('p#three').innerText = json.inCATwo
		fragment.querySelector('p#four').innerText = json.inCAThree
	}
	else
	{
		let answerArray = [json.correctA, json.inCAOne, json.inCATwo, json.inCAThree]
		shuffle(answerArray)
		fragment.querySelector('p#one').innerText = answerArray[0]
		fragment.querySelector('input#one').value = answerArray[0]
		fragment.querySelector('p#two').innerText = answerArray[1]
		fragment.querySelector('input#two').value = answerArray[1]
		fragment.querySelector('p#three').innerText = answerArray[2]
		fragment.querySelector('input#three').value = answerArray[2]
		fragment.querySelector('p#four').innerText = answerArray[3]
		fragment.querySelector('input#four').value = answerArray[3]
		if (json.testDone != "true")
		{
			fragment.querySelector('form').addEventListener('submit', async event => 
			{
				event.preventDefault()
				var answers = document.getElementsByName('test');
        	    let theAnswer = "None"
            	for(let i = 0; i < answers.length; i++) {
        	        if(answers[i].checked) 
					{
						theAnswer = answers[i].value
						if (answers[i].value != json.correctA) document.querySelector('p#qOutput').innerText = `Incorrect, the correct answer was "${json.correctA}"`
						else document.querySelector('p#qOutput').innerText = `Correct the answer was "${json.correctA}"`
					}
				
        	    }
				console.log(theAnswer)
				await answerQuestion(theAnswer, queryString)
			})
		} else
		{
			if (json.answerCorrect != "true") fragment.querySelector('p#qOutput').innerText = `Incorrect, the correct answer was "${json.correctA}"`
			else fragment.querySelector('p#qOutput').innerText = `Correct the answer was "${json.correctA}"`
			let testButton = fragment.querySelector('button#testButton')
			testButton.remove()
		}
		
	}
	console.log(json.text)
	node.appendChild(fragment)
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  while (currentIndex != 0) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

async function answerQuestion(answer, queryString)
{
	console.log("Answering " + answer + " to question for content number " + queryString.id)
	let token = localStorage.getItem('authorization')
	token = `Bearer ${token}`
	const theBody = 
	{
		"answer": answer
	}
	let url = `https://partner-parent-8080.codio-box.uk/api/answer/${queryString.id}`
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
    showMessage("Question answered!")
}

async function noQuestion(json, node)
{
	let template = document.querySelector('template#contentTemplate')
	let fragment = template.content.cloneNode(true)
	fragment.querySelector('h2').innerText = json.title
	console.log(fragment.querySelector('h2').innerText)
	const converter = new showdown.Converter({'tables': true, 'tasklists': true, 'strikethrough': true})
    const html = converter.makeHtml(json.text)
	console.log(json.text)
	//console.log(html)
	fragment.querySelector('pre#text').innerHTML = html
	fragment.querySelector('img#image').setAttribute('src', json.imageUrl)
	console.log(json.text)
	//fragment.querySelector('select#test').setAttribute('hidden')
	node.appendChild(fragment)
}