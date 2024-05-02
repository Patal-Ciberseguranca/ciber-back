import pool from '../../services/pool'

export default function handler(req, res) {
    return new Promise((resolve, reject) => {
        if (req.method === 'POST') {
            const { username, message } = req.body;

            if (username == null)
                return res.status(422).send({ message: 'Missing Username' })

            if (message == null)
                return res.status(422).send({ message: 'Missing Message Content' })

            var date = new Date();
            var dd = date.getDate();
            var mm = date.getMonth()+1;
            var yyyy = date.getFullYear();
            
            if(dd<10) dd="0"+dd
            
            if(mm<10) mm="0"+mm
            
            date = dd+"/"+mm+"/"+yyyy;

            /* 
                TO-DO
                A mensagem precisa de ser encriptada aqui antes de ir para a SQL
            */

            pool.execute('INSERT INTO messages (date, username, message) VALUES (?, ?, ?)', [date, username, message], (err, rows, fields) => {
                if (err) {
                    if (err.errno === 1062) {
                        if (new RegExp(/('username')$/).test(err.message)) {
                            return res.status(409).send({ message: 'Username Doesn\'t Exist' })
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