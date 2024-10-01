import express from 'express'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import { rateLimit } from 'express-rate-limit'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(__dirname, '../node_modules/quotobot/db/quotes.db')
const db = sqlite3.cached.Database(dbPath, sqlite3.OPEN_READONLY)
const dbGet = promisify(db.get).bind(db)

const app = express()
const rateLimitConfig = {
    windowMs: 1000,
    limit: 2, // 2 requests in 1 sec
    standardHeaders: 'draft-7',
    legacyHeaders: false,
}
app.use(rateLimit(rateLimitConfig))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})
app.get('/randquote', async function (_req, res) {
    const { quote, source: author } = await dbGet('SELECT quote, source FROM Quotes WHERE id IN (SELECT id FROM Quotes ORDER BY RANDOM() LIMIT 1);')
    res.json({ quote, author })
})
app.get('/', function (_req, res) {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Quotoserve</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <style>
        body { font-family: sans-serif; }
    </style>
    <body>
    <h1>Quotoserve</h1>
    <p>Available routes:
        <ul>
            ${app._router.stack
            .filter(r => r.route?.path !== undefined)
            .map(r => `<li><a href="${r.route.path}">${r.route.path}</a></li>`)
            .join('')}
        </ul>
    </p>
    <p>Rate Limit: ${rateLimitConfig.limit} requests in ${rateLimitConfig.windowMs / 1000} second(s)</p>
    </body>
    </html>
    `)
})

const port = 3000
app.listen(port, "", () => { console.log('App listening at http://localhost:' + port) })

export default app
