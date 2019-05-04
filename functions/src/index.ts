import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
admin.initializeApp()

const firestore = admin.firestore()
const app = express()

app.get('/edit/:url', (req, res) =>
	res.status(200).send(`
		<!DOCTYPE html>
		<html>
			<head>

			</head>
			<body>

			</body>
		</html>
	`)
)

exports.app = functions.https.onRequest((req, res) =>
	req.url.split('/')[1] === 'edit'
		? app(req, res)
		: firestore.doc(`public/${req.url}`).get().then(page =>
			res.status(200).send(page.exists
				? page.data()!.html
				: `
					<!DOCTYPE html>
					<html>
						<head>
							
						</head>
						<body>

						</body>
					</html>
				`
			)
		)
)