example = require('./example.js');

example.whatsMyName();

async function errOne() {
	return Promise.all([1, 2, 3].map(async number => {
		return await a(number)
	}))
}

async function a(num) {
	if (num == 2 || num == 3) throw new Error('Number Oopsie'+num)
	return 'B'
}

async function b() {
	return await errOne();
}

b().then(d => console.log(d)).catch(err => console.log('A', err))