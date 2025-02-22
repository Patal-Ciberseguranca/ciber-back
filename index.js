const express = require('express');
const {collection, registos} = require('./mongo');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const JWT_SECRET = 'sua_chave_secreta_aqui';


// Função para gerar um número aleatório único para cada usuário
function generateRandomNumber() {
  return Math.floor(Math.random() * 1000000); // Altere conforme necessário para atender aos requisitos de unicidade
}

// Função para criar um hash com Crypt 1024 vezes
async function hashKeyWithIterations(key) {
  let hashedKey = crypto.createHash('sha256').update(key).digest();
  for (let i = 0; i < 1024; i++) {
    hashedKey = crypto.createHash('sha256').update(hashedKey).digest().slice(0, 8);
  }
  hashedKey = hashedKey.toString('hex');
  return hashedKey;
}


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


// POST do Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const check = await collection.findOne({ username: username });

    if (check) {
      const matchPassword = await bcrypt.compare(password, check.password);

      if (matchPassword){
        // Concatenar senha com número aleatório
        const key = password + check.randomNumber.toString();
        // Aplicar hash à concatenação 1024 vezes
        const hashedKey = await hashKeyWithIterations(key);


        // Criação do token JWT
        const token = jwt.sign({ id: check._id }, JWT_SECRET, {
          expiresIn: 86400 // expira em 24 horas
        });
        res.header('authorization', token)
        res.json({token, userId:check._id, key: hashedKey, message:'Sucesso', cipherMode: check.cipherMode, hmacMode: check.hmacMode});


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


// POST do Registo
app.post('/register', async (req, res) => {
  const { username, email, password, cipherMode, hmacMode } = req.body;

  try {
    const check = await collection.findOne({ username: username });

    if (check) {
      res.json('UtilizadorExiste');
    } else {
      // Criar Hash da Password usando BCrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      // Gerar Número Aleatório para cada Utilizador
      const randomNumber = generateRandomNumber();

      
      const data = {
        username: username,
        email: email,
        password: hashedPassword,
        randomNumber: randomNumber,
        cipherMode: cipherMode,
        hmacMode: hmacMode
      };
      
      console.log(data)
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


// POST para armazenar registros
app.post('/registos', async (req, res) => {
  const { username, textoCifrado, HMACmsg, cipherMode, hmacMode } = req.body;

  var date = new Date();
  var dd = date.getDate();
  var mm = date.getMonth()+1;
  var yyyy = date.getFullYear();
  if(dd<10) dd="0"+dd
  if(mm<10) mm="0"+mm
  date = dd+"/"+mm+"/"+yyyy;

  try {
    const data = {
      date: date,
      username: username,
      registo: textoCifrado,
      hmac: HMACmsg,
      cipherMode: cipherMode,
      hmacMode: hmacMode
    };

    await registos.insertMany([data]);
    console.log("Sucesso");

    res.json({ success: true, mensagem: 'Registro cifrado armazenado com sucesso.' });
  } catch (error) {
    console.error('Erro ao armazenar registro cifrado:', error);
    res.status(500).json({ success: false, mensagem: 'Erro ao armazenar registro cifrado.' });
  }
});

// GET de todos os registos na BD
app.get('/registos', async (req, res) =>{
  try {
    //Find de todos os registos
    const cursor = await registos.find({});
    //Array dos Registos
    const allRegistos = [];
    //Acrescentar cada registo a um array
    await cursor.forEach(registo => {
      allRegistos.push(registo);
    });
    //Mostrar os registos todos
    res.json({ success: true, registos: allRegistos });
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    res.status(500).json({ success: false, mensagem: 'Erro ao buscar registros.' });
  }
})


// Isto acessa o username guardado nos dados local e procura os registos pelo user
app.get('/registos/:username', async (req,res) =>{
  try{
    //acessar username
    const username = req.params.username;
    //pesquisar username
    const cursor = await registos.find({username: username});
    res.json({ success: true, registos: cursor });
  }catch (error){
    console.error('na deu ', error);
    res.status(500).json({ success: false, mensagem: 'Erro ao buscar registros.' });
  }
});

// Rota protegida
app.get('/profile', verifyToken, (req, res) => {
  res.json('Conteúdo protegido');
});

app.listen(3000, () => {
  console.log('Porta Conectada');
});