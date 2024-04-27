import pool from '../../services/pool'

export default function handler(req, res) {
    return new Promise((resolve, reject) => {
        if (req.method === 'POST') {
            const { user_id, reciever_id, message } = req.body;

            if (user_id == null)
                return res.status(422).send({ message: 'Missing User ID' })

            if (reciever_id == null)
                return res.status(422).send({ message: 'Missing Reciever ID' })

            if (message == null)
                return res.status(422).send({ message: 'Missing Message Content' })

                pool.execute('INSERT INTO messages (user_id, reciever_id, message) VALUES (?, ?, ?)',
                [user_id, reciever_id, message]
                , (err, rows, fields) => {
                    if (err) {
                        if (err.errno === 1062) {
                            if (new RegExp(/('user_id')$/).test(err.message)) { /* Regex match to check error */
                                return res.status(409).send({ message: 'User ID Doesn\'t Exist' })
                            }
    
                            if (new RegExp(/('reciever_id')$/).test(err.message)) { /* Regex match to check error */
                                return res.status(409).send({ message: 'Reciever ID Doesn\'t Exist' })
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