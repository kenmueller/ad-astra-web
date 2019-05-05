import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
admin.initializeApp()

const firestore = admin.firestore()
const app = express()

app.get('/edit/:url', (req, res) => {
	const url = req.params.url
	return firestore.doc(`public/${url.replace('/', '\\')}`).get().then(page => page.exists
		? res.status(200).send(createPage(
			`Edit ${url}`,
			`
				.textarea.edit.html {
					height: 400px;
				}
				.button.edit.complete {
					margin: auto;
				}
			`,
			`
				<textarea class="textarea edit html" placeholder="Press submit to delete page"></textarea>
				<br>
				<a class="button is-large is-success edit complete"><strong>Submit</strong></a>
			`,
			`
				const textarea = document.querySelector('.textarea.edit.html')
				textarea.value = \`${page.data()!.html}\`
				document.querySelector('.button.edit.complete').addEventListener('click', () =>
					textarea.value.trim().length === 0
						? firebase.firestore().doc('public/${url.replace('/', '\\\\')}').delete().then(() => location.reload())
						: firebase.firestore().doc('public/${url.replace('/', '\\\\')}').update({ html: textarea.value })
				)
			`
		))
		: res.status(404).redirect(`/${url}`)
	)
})

exports.app = functions.https.onRequest((req, res) => {
	const urlParts = req.url.split('/').slice(1)
	const url = urlParts.join('/')
	return urlParts[0] === 'edit'
		? urlParts.length === 1
			? editIndex(res)
			: app(req, res)
		: firestore.doc(`public/${url.length === 0 ? '\\' : url.replace('/', '\\')}`).get().then(page =>
			res.status(200).send(page.exists
				? page.data()!.html
				: createPage(
					`Create ${url.length === 0 ? 'index' : url}`,
					`
						.textarea.new.html {
							height: 400px;
						}
						.button.new.complete {
							margin: auto;
						}
					`,
					`
						<textarea class="textarea new html" placeholder="Write your HTML here"></textarea>
						<br>
						<a class="button is-large is-success new complete" disabled><strong>Create</strong></a>
					`,
					`
						const textarea = document.querySelector('.textarea.new.html')
						const complete = document.querySelector('.button.new.complete')
						textarea.addEventListener('input', () =>
							complete.disabled = textarea.value.trim().length === 0
						)
						complete.addEventListener('click', () =>
							textarea.value.trim().length === 0
								? Promise.resolve()
								: firebase.firestore().doc('public/${url.length === 0 ? '\\\\' : url.replace('/', '\\\\')}').set({ html: textarea.value }).then(() => location.reload())
						)
					`
				)
			)
		)
})

function editIndex(res: functions.Response): Promise<void | functions.Response> {
	return firestore.doc('public/\\').get().then(page => page.exists
		? res.status(200).send(createPage(
			`Edit index`,
			`
				.textarea.edit.html {
					height: 400px;
				}
				.button.edit.complete {
					margin: auto;
				}
			`,
			`
				<textarea class="textarea edit html" placeholder="Press submit to delete page"></textarea>
				<br>
				<a class="button is-large is-success edit complete"><strong>Submit</strong></a>
			`,
			`
				const textarea = document.querySelector('.textarea.edit.html')
				textarea.value = \`${page.data()!.html}\`
				document.querySelector('.button.edit.complete').addEventListener('click', () =>
					textarea.value.trim().length === 0
						? firebase.firestore().doc('public/\\\\').delete().then(() => location.reload())
						: firebase.firestore().doc('public/\\\\').update({ html: textarea.value })
				)
			`
		))
		: res.status(404).redirect('/')
	)
}

function createPage(title: string, style: string, body: string, script: string): string {
	return `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<script defer src="/__/firebase/5.8.4/firebase-app.js"></script>
				<script defer src="/__/firebase/5.8.4/firebase-auth.js"></script>
				<script defer src="/__/firebase/5.8.4/firebase-firestore.js"></script>
				<script defer src="/__/firebase/5.8.4/firebase-messaging.js"></script>
				<script defer src="/__/firebase/5.8.4/firebase-storage.js"></script>
				<script defer src="/__/firebase/init.js"></script>
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.4/css/bulma.min.css">
				<script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
				<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
				<title>${title}</title>
				<style>
					html, body {
						font-family: 'Open Sans', serif;
						font-size: 16px;
						line-height: 1.5;
						height: 100%;
						background: #ECF0F3;
					}
					${style}
				</style>
			</head>
			<body>
				${body}
				<script>${script}</script>
			</body>
		</html>
	`
}