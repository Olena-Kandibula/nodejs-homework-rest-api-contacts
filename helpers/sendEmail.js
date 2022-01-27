const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const { SENDGRID_API_KEY, SEND_EMAIL_FROM } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//  const data = {
//     to: "44444@gmail.com",    
//     subject: "Новая заявка с сайта",
//     html: "<p>Ваша заявка принята</p>"
// }

const sendEmail = async (data) => {
    
    try {
        const email = { ...data, from: SEND_EMAIL_FROM }

        await sgMail.send(email);
        return true;
        
    } catch (error) {
        console.error(error);
    }
}

module.exports = sendEmail;

