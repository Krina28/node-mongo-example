const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const models = {};
const mongoose = require('mongoose');

if (process.env.DB_HOST != '') {
    var files = fs
        .readdirSync(__dirname)
        .filter((file) => {
            return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
        })
        .forEach((file) => {
            var filename = file.split('.')[0];
            var model_name = filename.charAt(0).toUpperCase() + filename.slice(1);
            models[model_name] = require('./' + file);
        });

    mongoose.Promise = global.Promise; //set mongo up to use promises

    let pwd = '8wC7sor95RoFe8rQ';
    //4df0de59-7ac0-40e7-b197-01922121d095 - Private key
    const uri = "mongodb+srv://demo:" + encodeURIComponent(pwd) + "@cluster0-dl0cq.mongodb.net/test?retryWrites=true&w=majority";

    mongoose.connect(uri, { useNewUrlParser: true }).catch((err) => {
        console.log('*** Can Not Connect to Mongo Server:', uri)
    })

    let db = mongoose.connection;
    module.exports = db;
    db.once('open', () => {
        console.log('Connected to mongo at ' + uri);
    })
    db.on('error', (error) => {
        console.log("error kjdf", error);
    })
    // End of Mongoose Setup
} else {
    console.log("No Mongo Credentials Given");
}

module.exports = models;
