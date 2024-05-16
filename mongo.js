const mongoose = require('mongoose');
mongoose
  .connect('mongodb+srv://carneiro:joaogoodman@login.i3fuljo.mongodb.net/CANTTOUCHME')

  .then(() => {
    console.log('MongoDB conectado com Sucesso');
  })
  .catch(() => {
    console.log('Falhou');
  });


// Schema para os users
const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  randomNumber: {
    type: Number,
  },
});


// Schema para os registos
const registosSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },  
  registo: {
    type: String,
    required: true,
  },
  hmac: {
    type: String,
    required: true,
  },
});


const collection = mongoose.model('Users', usersSchema);
const registos = mongoose.model('Registos', registosSchema);


module.exports = {collection, registos};

