import pool from '../../services/pool'

export default function handler(req, res) {
    return new Promise((resolve, reject) => {
        if (req.method === 'POST') {
            const { username, email, password } = req.body;

            if (email == null)
                return res.status(422).send({ message: 'Missing E-Mail' })

            if (username == null)
                return res.status(422).send({ message: 'Missing Username' })

            if (password == null)
                return res.status(422).send({ message: 'Missing Password' })

            /* TO-DO
                Cifrar a Password Usando o Campo do Register Enviado
                const encryptedPassword = encrypt(password, password)
            */

            pool.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
            , (err, rows, fields) => {
                if (err) {
                    if (err.errno === 1062) {
                        if (new RegExp(/('username')$/).test(err.message)) {
                            return res.status(409).send({ message: 'Username already taken' })
                        }

                        if (new RegExp(/('email')$/).test(err.message)) {
                            return res.status(409).send({ message: 'Email already taken' })
                        }
                    }
                    return res.status(500).send({ err })
                }
                return res.status(200).send(rows)
            })
        } else {
            return res.status(405).send({ message: 'Request not allowed' })
        }
    })
}