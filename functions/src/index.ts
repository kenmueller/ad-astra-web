import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
admin.initializeApp()

const firestore = admin.firestore()
const app = express()

app.get('/edit/:url', (req, res) => {
	const url = req.url.split('/').slice(2).join('/')
	return firestore.doc(`public/${url === 'index' ? '\\' : url.replace('/', '\\')}`).get().then(page =>
		res.status(200).send(`
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
					<title>Edit ${url}</title>
					<style>
						html, body {
							font-family: 'Open Sans', serif;
							font-size: 16px;
							line-height: 1.5;
							height: 100%;
							background: #ECF0F3;
						}
						.textarea.edit.html {
							height: 400px;
						}
						.button.edit.complete {
							margin: auto;
						}
					</style>
				</head>
				<body>
					<textarea class="textarea edit html" placeholder="Press submit to delete page"></textarea>
					<br>
					<a class="button is-large is-success edit complete"><strong>Submit</strong></a>
					<script>
						const textarea = document.querySelector('.textarea.edit.html')
						textarea.value = '${page.data()!.html}'
						document.querySelector('.button.edit.complete').addEventListener('click', () =>
							firebase.firestore().doc('public/${url === 'index' ? '\\\\' : url.replace('/', '\\\\')}').update({ html: textarea.value })
						)
					</script>
				</body>
			</html>
		`)
	)
})

exports.app = functions.https.onRequest((req, res) => {
	const url = req.url.split('/').slice(1).join('/')
	return url[0] === 'edit'
		? app(req, res)
		: firestore.doc(`public/${url.replace('/', '\\')}`).get().then(page =>
			res.status(200).send(page.exists
				? page.data()!.html
				: `
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
							<title>Create ${url}</title>
							<style>
								html, body {
									font-family: 'Open Sans', serif;
									font-size: 16px;
									line-height: 1.5;
									height: 100%;
									background: #ECF0F3;
								}
								.textarea.new.html {
									height: 400px;
								}
								.button.new.complete {
									margin: auto;
								}
							</style>
						</head>
						<body>
							<textarea class="textarea new html" placeholder="Write your HTML here"></textarea>
							<br>
							<a class="button is-large is-success new complete" disabled><strong>Create</strong></a>
							<script>
								const textarea = document.querySelector('.textarea.new.html')
								const complete = document.querySelector('.button.new.complete')
								textarea.addEventListener('input', () =>
									complete.disabled = textarea.value.trim().length === 0
								)
								complete.addEventListener('click', () =>
									textarea.value.trim().length === 0
										? Promise.resolve()
										: firebase.firestore().doc('public/${url === 'index' ? '\\\\' : url.replace('/', '\\\\')}').set({ html: textarea.value })
								)
							</script>
						</body>
					</html>
				`
			)
		)
})