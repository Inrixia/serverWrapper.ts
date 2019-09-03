process.on('message', message => {
    message.hi = 1;
    console.log(message)
    process.exit();
})