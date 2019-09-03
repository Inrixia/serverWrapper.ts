const readline = require('readline');

//readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true);

// const rl = readline.createInterface({
// 	input: process.stdin,
// 	output: process.stdout,
// 	terminal: true,
// 	historySize: 10000,
// 	prompt: ''
// });

// // process.stdin.addListener("data", string => {
// // 	console.log('>'+string)
// // });
// process.stdin.on('keypress', (str, key) => {
// 	if (key.ctrl && key.name === 'c') process.exit();
// 	console.log(key);
// });

process.emit('test', {data: 'hi'})
process.send('hi')