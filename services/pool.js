const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const crypto = require('crypto');

const app = express();
const port = 3001;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'projetociber'
});

db.connect(err => {
  if (err) throw err;
  console.log('> MySQL Connection Successful!');
});

app.use(bodyParser.json());

function encryptPassword(password, key, iv) {
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptPassword(encryptedPassword, key, iv) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

app.get('/api/login', (req, res) => {
  const username = (req.body && req.body.username ? toString(req.body.username) : null)
  const password = (req.body && req.body.password ? req.body.password : null)
  if (username == null || password == null) return false;
  db.query('SELECT * FROM users WHERE username = ?', {username}, (err, result) => {
    if (err) throw err;
    const key = crypto.randomBytes(16); // 16 bytes - AES-128
    const iv = crypto.randomBytes(16);
    const gotEncryptedPassword = decryptPassword(result.password, key, iv);
    if (password == gotEncryptedPassword) return res.json(result);
    return false;
  });
});

app.get('/api/register', (req, res) => {
  const username = (req.body && req.body.username ? toString(req.body.username) : null)
  const email = (req.body && req.body.email ? toString(req.body.email) : null)
  const password = (req.body && req.body.password ? req.body.password : null)
  if (username == null || email == null || password == null) return false;
  const key = crypto.randomBytes(16); // 16 bytes - AES-128
  const iv = crypto.randomBytes(16);
  const sentEncryptedPassword = encryptPassword(password, key, iv);
  db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', {username, email, sentEncryptedPassword}, (err, result) => {
    if (err) throw err;
    if (result != null) return res.json(result);
    return false;
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});