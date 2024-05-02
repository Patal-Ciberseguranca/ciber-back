import pool from '../../services/pool'

export default function handler(req, res) {
    return new Promise((resolve, reject) => {
        if (req.method === 'GET') {
            const { date, username } = req.body;

            if (username == null)
                return res.status(422).send({ message: 'Missing Username' })

            
            if (date == null) {
                pool.query('SELECT * FROM records WHERE username = ?', [username] , (err, rows, fields) => {
                    if (err) {
                        if (err.errno === 1062) { // MySQL error code for duplicate entry
                            if (new RegExp(/('username')$/).test(err.message)) { /* Regex match to check error */
                                return res.status(409).send({ message: 'Username doesn\'t exist' })
                            }
                        }

                        return res.status(500).send({ err })
                    }

                    if (rows.length === 0) {
                        return res.status(400).send({ message: 'No Records From That User Saved.' });
                    }

                    /*
                        TO-DO
                        Decifrar cada uma das mensagens do array retornado da BD
                    */

                    return res.status(200).send(rows);
                })
            } else {
                pool.query('SELECT * FROM records WHERE username = ? AND date LIKE ?', [username, date] , (err, rows, fields) => {
                    if (err) {
                        if (err.errno === 1062) {
                            if (new RegExp(/('username')$/).test(err.message)) {
                                return res.status(409).send({ message: 'Username doesn\'t exist' })
                            }
                        }

                        return res.status(500).send({ err })
                    }

                    if (rows.length === 0) {
                        return res.status(400).send({ message: 'No Records From That User In That Date Saved.' });
                    }

                    /*
                        TO-DO
                        Decifrar cada uma das mensagens do array retornado da BD
                    */

                    return res.status(200).send(rows);
                })
            }
        } else {
            return res.status(405).send({ message: 'Request not allowed' })
        }
    })
}