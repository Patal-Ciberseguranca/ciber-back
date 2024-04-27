import pool from '../../services/pool'

export default function handler(req, res) {
    return new Promise((resolve, reject) => {
        if (req.method === 'POST') {
            const { user_id } = req.body;

            if (user_id == null)
                return res.status(422).send({ message: 'Missing User ID' })

            var messages = [];

            pool.query('SELECT * FROM messages WHERE reciever_id = ?',
            [user_id]
            , (err, rows, fields) => {
                if (err) {
                    if (err.errno === 1062) { // MySQL error code for duplicate entry
                        if (new RegExp(/('reciever_id')$/).test(err.message)) { /* Regex match to check error */
                            return res.status(409).send({ message: 'Reciever ID doesn`t exist' })
                        }
                    }

                    return res.status(500).send({ err })
                }

                if (rows.length === 0) {
                    return res.status(400).send({ message: 'Reciever ID doesn\'t exist' });
                }

                messages.append(rows);

                pool.query('SELECT * FROM messages WHERE sender_id = ?',
                [user_id]
                , (err, rows, fields) => {
                    if (err) {
                        if (err.errno === 1062) { // MySQL error code for duplicate entry
                            if (new RegExp(/('reciever_id')$/).test(err.message)) { /* Regex match to check error */
                                return res.status(409).send({ message: 'Reciever ID doesn`t exist' })
                            }
                        }
    
                        return res.status(500).send({ err })
                    }
    
                    if (rows.length === 0) {
                        return res.status(400).send({ message: 'Reciever ID doesn\'t exist' });
                    }
    
                    messages.append(rows);
                })

                return messages;
            })
        } else {
            return res.status(405).send({ message: 'Request not allowed' })
        }
    })
}