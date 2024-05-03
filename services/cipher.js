const secretKey = "ad917203c9aec5fd0877864a90d931e3";
const secretIV = "0e9441be0790175d33ad0a53fa65413d";

const Encrypt = (message) => {
    /* Cifrar */
    return EncryptMessage(message, secretKey, secretIV); 
}

const Decrypt = (message) => {
    /* Decifrar */
    return DecryptMessage(message, secretKey, secretIV); 
}

module.exports = { Encrypt, Decrypt }