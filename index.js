import express from 'express'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import { rateLimit } from 'express-rate-limit'

const db = sqlite3.cached.Database('./node_modules/quotobot/db/quotes.db', sqlite3.OPEN_READONLY)
const dbGet = promisify(db.get).bind(db)

const app = express()
const limiter = rateLimit({
    windowMs: 1000,
    limit: 2, // 2 requests in 1 sec
    standardHeaders: 'draft-7',
    legacyHeaders: false,
})
app.use(limiter)

app.get('/randquote', async function (req, res) {
    const { quote, source: author } = await dbGet('SELECT quote, source FROM Quotes WHERE id IN (SELECT id FROM Quotes ORDER BY RANDOM() LIMIT 1);')
    res.json({ quote, author })
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

const port = 3000
app.listen(port, "", () => { console.log('App listening at http://localhost:' + port) })

export default app