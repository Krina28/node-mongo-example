var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
//pwd mlab - 8wC7sor95RoFe8rQ
let pwd = '8wC7sor95RoFe8rQ';
//4df0de59-7ac0-40e7-b197-01922121d095 - Private key
const uri = "mongodb+srv://demo:" + encodeURIComponent(pwd) + "@cluster0-dl0cq.mongodb.net/test?retryWrites=true&w=majority";

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6,
};

console.log(uri)
mongoose.connect(uri, options).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
  err => {
    /** handle initial connection error */
    console.log('>>>>err', err);
  }
);

mongoose.set('debug', true);

module.exports = mongoose;
