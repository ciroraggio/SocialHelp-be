const sendGrid = require('@sendgrid/mail')
const APIKey = process.env.EMAIL_API_KEY
const socialHelpEmail = process.env.EMAIL

sendGrid.setApiKey(APIKey)

const sendWelcome = (email, name) => {
    sendGrid.send({
        to: email,
        from: socialHelpEmail,
        subject: 'Thanks for joining SocialHelp!',
        text: `Ehi ${name}! Welcome to SocialHelp!\n`
    })
}

const sendAccountDeleted = (email, name) => {
    sendGrid.send({
        to: email,
        from: socialHelpEmail,
        subject: 'Your SocialHelp account has been deleted!',
        text: `Ehi ${name}! Your SocialHelp account has been deleted!\n`
    })
}

module.exports= {
    sendWelcome,
    sendAccountDeleted
}
