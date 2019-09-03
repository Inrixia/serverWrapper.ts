const EventEmitter = require('events');

const children = require('child_process');

// example = require('./example.js');

// example.whatsMyName();

// async function errOne() {
// 	return Promise.all([1, 2, 3].map(async number => {
// 		return await a(number)
// 	}))
// }

// async function a(num) {
// 	if (num == 2 || num == 3) throw new Error('Number Oopsie'+num)
// 	return 'B'
// }

// async function b() {
// 	return await errOne();
// }

// //b().then(d => console.log(d)).catch(err => console.log('A', err))

class sSClass {
	constructor() {
		this._sS = {};
	}
	get sS() {
		return this._sS;
	}

	set sS(sS) {
		this._sS = sS;
	}
}
// class modul {
// 	constructor() {
// 		this.event = new EventEmitter();
// 		this.event.once('newListener', (event, listener) => {
// 			console.log(event, listener)
// 		});
// 		//setTimeout(() => { this.event.emit('discord', {'data': 'boop'}) }, 1000)

// 		this._sS = new sSClass();
// 		setTimeout(() => { this.sS = 'something else' }, 1000)
// 		setTimeout(() => console.log(this.sS), 1200)
// 	}
// }

// event = new EventEmitter();
// event.once('newListener', (event, listener) => {
// 	console.log(event, listener)
// });

// event.on('discord', (data) => {
// 	//console.log(data)
// })


let ex = children.fork('example.js');
ex.on('test', data => {
	console.log(data)
})

ex.on('message', data => {
	console.log(data)
})