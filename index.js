import express from 'express'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'

const db = sqlite3.cached.Database('./node_modules/quotobot/db/quotes.db', sqlite3.OPEN_READONLY)
const dbGet = promisify(db.get).bind(db)

const app = express()

app.get('/randquote', async function (req, res) {

    const { quote, source } = await dbGet('SELECT quote, source FROM Quotes WHERE id IN (SELECT id FROM Quotes ORDER BY RANDOM() LIMIT 1);')
    res.json({quote, source})
})
app.get('/', function (req, res) {
    res.send(`
    <h1>Quotoserve</h1>
    <p>Available routes:
        <ul>
            <li>${app._router.stack.map(r => r.route?.path).filter(r => r !== undefined).join("</li><li>")}</li>
        </ul>
    </p>
    `)
})
console.log(app._router.stack.map(r => r.route?.path).filter(r => r !== undefined))
app.listen(3000)