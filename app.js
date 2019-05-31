var express = require('express');
var fs = require('fs')
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var mailer = require('express-mailer');
var dotenv = require('dotenv').config();
var fileUpload = require('express-fileupload');
var app = express();

app.use(cors());

app.use(logger('dev'));

// create a write Usersstream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// setup the logger
app.use(logger('combined', { stream: accessLogStream }))

// Json parser
app.use(bodyParser.json({ limit: "2.7mb", extended: false }));
app.use(bodyParser.urlencoded({ limit: "2.7mb", extended: false }));
app.use(fileUpload({
  limits: {
    fileSize: 10 * 1024 * 1024
  }
}));
// Set views folder for emails
app.set('views', __dirname + '/views');
// Set template engin for view files
app.set('view engine', 'pug');

// SMTP setting
mailer.extend(app, {
  // from: process.env.MAIL_FROM_NAME,
  from: process.env.MAIL_FROM_NAME + " <" + process.env.MAIL_FROM_EMAIL + ">",
  host: process.env.MAIL_HOST, // hostname
  // secureConnection: process.env.MAIL_SECURE_CONNECTION, // use SSL
  port: process.env.MAIL_PORT, // port forSMTP
  // transportMethod: process.env.MAIL_TRANSPORT_METHOD, // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

// Make Images public
app.use(express.static('uploads'))

app.all('/*', function (req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,Client-Key');
  if (req.method == 'OPTIONS') {
    res
      .status(200)
      .end();
  } else {
    next();
  }
});

//Routes
app.use('/', require('./routes'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Start the server
app.set('port', process.env.PORT);
app.listen(app.get('port'), function () {
  console.log("Application is running on 7878 port....");
});

//Promise Handler
process.on('unhandledRejection', error => {
  console.error('Uncaught Error', pe(error));
});

process.on('uncaughtException', function (error) { }); // Ignore error

CronSendEmail = async (requestedData) => {
  var template = requestedData.template;
  var email = requestedData.email;
  var body = requestedData.body;
  var extraData = requestedData.extraData;
  var subject = requestedData.subject;

  await app.mailer
    .send(template, {
      to: email,
      subject: process.env.MAIL_FROM_NAME + ': ' + subject,
      body: body,
      data: extraData,// All additional properties are also passed to the template as local variables.
      PRODUCT_NAME: process.env.PRODUCT_NAME,
      SITE_URL: process.env.SITE_URL,
      BACKEND_URL: process.env.BACKEND_URL
    }, function (err) {
      if (err) {
        return 0;
      } else {
        return 1;
      }
    });
}

module.exports = CronSendEmail;
