const express = require('express');
const collection = require('./mongo');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const JWT_SECRET = 'sua_chave_secreta_aqui';


// Função para verificar o token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ auth: false, message: 'Token não fornecido.' });

  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
    if (err) return res.status(500).json({ auth: false, message: 'Falha ao autenticar o token.' });

    // Se tudo estiver correto, salva no request para uso posterior
    req.userId = decoded.id;
    next();
  });
}

app.get('/', cors(), (req, res) => {});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const check = await collection.findOne({ username: username });

    if (check) {
      const matchPassword = await bcrypt.compare(password, check.password);
      if (matchPassword){
        // Criação do token JWT
        const token = jwt.sign({ id: check._id }, JWT_SECRET, {
          expiresIn: 86400 // expira em 24 horas
        });
        res.header('authorization', token)
        res.json({token, userId:check._id, message:'Sucesso'});


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
      // Criar Hash da Password usando BCrypt
      const hashedPassword = await bcrypt.hash(password, 10);


      const data = {
        username: username,
        email: email,
        password: hashedPassword,
      };
    
      await collection.insertMany([data]);
      
      // Criação do token JWT
      const token = jwt.sign({ id: data._id }, JWT_SECRET, {
        expiresIn: 86400 // expira em 24 horas
      });
      res.header('authorization', token)
      res.json({token, userId:data._id, message:'Sucesso'});
    }

  } catch (e) {
    res.status(500).json('Erro');
    console.log(e);
  }
});

// Rota protegida
app.get('/profile', verifyToken, (req, res) => {
  res.json('Conteúdo protegido');
});

app.listen(3000, () => {
  console.log('Porta Conectada');
});