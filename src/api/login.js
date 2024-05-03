import pool from '../../services/pool'
import { Encrypt, Decrypt } from '../../services/cipher'

export default function handler(req, res) {
    return new Promise((resolve, reject) => {
        if (req.method === 'GET') {
            const { username, password } = req.body;

            if (username == null)
                return res.status(422).send({ message: 'Missing Username' })

            if (password == null)
                return res.status(422).send({ message: 'Missing Password' })

            pool.query('SELECT * FROM users WHERE username = ?',
            [username]
            , (err, rows, fields) => {
                if (err) {
                    if (err.errno === 1062) {
                        if (new RegExp(/('username')$/).test(err.message)) {
                            return res.status(409).send({ message: 'Username doesn`t exist' })
                        }
                    }
                    return res.status(500).send({ err })
                }

                if (rows.length === 0) {
                    return res.status(400).send({ message: 'Username doesn\'t exist' });
                }

                /*  TO-DO
                    Decifrar a Password Usando a do Campo Enviado para Conferir
                    const decryptedPassword = decrypt(rows[0].password, password) 
                */
               
                if (rows[0].password === password) {
                    return res.status(200).send(rows)
                }
                return res.status(400).send({ message: 'Incorrect password' })
            })
        } else {
            return res.status(405).send({ message: 'Request not allowed' })
        }
    })
}