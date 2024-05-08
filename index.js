const express = require('express');
const collection = require('./mongo');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', cors(), (req, res) => {});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const check = await collection.findOne({ username: username });

    if (check) {
      const matchPassword = await bcrypt.compare(password, check.password);
      if (matchPassword){
        res.json('Sucesso');
      } else {
        res.json('PasswordErrada')
      }
    } else {
      res.json('UtilizadorNaoExiste');
    }
  } catch (e){
  res.status(500).json('Erro');
  console.log(e);
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const check = await collection.findOne({ username: username });

    if (check) {
      res.json('UtilizadorExiste');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const data = {
        username: username,
        email: email,
        password: hashedPassword,
      };
    
      await collection.insertMany([data]);
      res.json('Sucesso');
    }
  } catch (e) {
    res.status(500).json('Erro');
    console.log(e);
  }
});

app.listen(3000, () => {
  console.log('Porta Conectada');
});