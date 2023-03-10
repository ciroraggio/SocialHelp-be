const sendGrid = require('@sendgrid/mail')
const APIKey = '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'

sendGrid.setApiKey(APIKey)

const sendWelcome = (email, name) => {
    sendGrid.send({
        to: email,
        from: 'socialhelp@gmail.com',
        subject: 'Thanks for joining SocialHelp!',
        text: `Ehi ${name}! Welcome to SocialHelp!\n`
    })
}

const sendAccountDeleted = (email, name) => {
    sendGrid.send({
        to: email,
        from: 'socialhelp@gmail.com',
        subject: 'Your SocialHelp account has been deleted!',
        text: `Ehi ${name}! Your SocialHelp account has been deleted!\n`
    })
}

module.exports= {
    sendWelcome,
    sendAccountDeleted
}