process.on('message', message => {
    message.lol = 2;
    console.log(message)
    process.exit();
})