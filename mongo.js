const mongoose = require('mongoose');
mongoose
  .connect('mongodb+srv://carneiro:joaogoodman@login.i3fuljo.mongodb.net/CANTTOUCHME')

  .then(() => {
    console.log('MongoDB conectado com Sucesso');
  })
  .catch(() => {
    console.log('Falhou');
  });



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
  encryptionKey: {
    type: String, // ou Buffer, dependendo da representação da chave
    required: true,
  },
});

const collection = mongoose.model('Users', usersSchema);

module.exports = collection;
