const sgMail = require('@sendgrid/mail');

const sendGridApiKey = process.env.SEND_GRID_API_KEY;

sgMail.setApiKey(sendGridApiKey);

let sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: `${email}`,
        from: 'sumeet4u55@gmail.com',
        subject: 'Tum Sahi Jagah Pahuncha!',
        text: `Baap ka, dada ka, sabka badla lega re tera --> ${name}`
    });
}

let sendGoodByeEmail = (email, name) => {
    sgMail.send({
        to: `${email}`,
        from: 'sumeet4u55@gmail.com',
        subject: 'Tussi jaa rahe ho!',
        text: `Jaani Dushman --> ${name}, ek anoka badla adhura!!`
    });
}

module.exports = { 
    sendWelcomeEmail,
    sendGoodByeEmail
}