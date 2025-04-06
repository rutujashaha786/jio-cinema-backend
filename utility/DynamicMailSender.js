const nodemailer = require('nodemailer')
const dotenv = require('dotenv');
const fs = require("fs")
dotenv.config();

async function updateTemplateHelper(templatePath, toReplaceObject){
    let templateString = await fs.promises.readFile(templatePath, "utf-8");

    const keysArr = Object.keys(toReplaceObject);
    keysArr.forEach((key) => {
        templateString = templateString.replace(`#{${key}}`, toReplaceObject[key]);
    })
    return templateString;
}

async function emailService(templatePath, receiverEmail, toReplaceObject){

    try{

        const content = await updateTemplateHelper(templatePath, toReplaceObject);

        const sendGridServiceDetails = {
            host : "smtp.sendgrid.net",
            port : "465",
            secure : true,
            auth : {
                user : "apikey",
                pass : process.env.SENDGRID_API_KEY
            }
        }
        
        const msg = {
          to: receiverEmail,
          from: 'rutujashaha786@gmail.com', // verified sender
          subject: 'Stream-Scene: Reset password OTP',
          text: "", //fallback to old HTML
          html: content, //HTML content in string format
        }
        
        const transporter = nodemailer.createTransport(sendGridServiceDetails);
        
        await transporter.sendMail(msg)
        console.log('Email sent')
    }
    catch(error){
        console.log("email not send because of the error", error);
    }
    
}

module.exports = emailService;

