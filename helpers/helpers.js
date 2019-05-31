/* Common functions which can be used anywhere */
var fcmConfig = require('../config/fcm');
var serverKey = fcmConfig.serverKey; //put your server key here
var User = require("../models/users");

// Used for Response Output in JSON Format
JsonFormat = async ( res, status, message, data, extra="" )=>{
    var output = {
        "status": status,
        "message": message,
        "data": data
    };
    if( extra != "" ){
      output.extra = extra;
    }
    return res.json( output );
}

SendEmail = async ( res, requestedData )=> {
    
    var template = requestedData.template;
    var email = requestedData.email;
    var body = requestedData.body;
    var extraData = requestedData.extraData;
    var subject = requestedData.subject;
    
    try{
        await res.mailer
        .send( template, {
            to: email,
            subject: process.env.MAIL_FROM_NAME + ': ' + subject,
            body: body, 
            data : extraData,// All additional properties are also passed to the template as local variables.
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
    }catch(err){
        return 0; 
    }
}

FileUpload = ( files, storepath ) =>{
    return new Promise(async (resolve, reject) => {
        var path = require('path');
        let image = files;
        let extention = path.extname(image.name)
        let timestamp = new Date().getTime().toString();
        let newImageName = (timestamp+extention);
        var newFile =storepath+newImageName;
        await image.mv( "uploads/"+newFile, function(err) {
            if (err){
                throw err
            }else{
                resolve( newFile );
            }                
        });
    });    
}

module.exports = {
    JsonFormat : JsonFormat,
    SendEmail : SendEmail,
    FileUpload: FileUpload,
}
