const children = require('child_process');

const test = {
    "name": "Hello World"
}

const childOne = children.fork('./child.js'); // Spawn the modules childprocess
const childTwo = children.fork('./childTwo.js'); // Spawn the modules childprocess

childOne.send(test);
childTwo.send(test);

setTimeout(() => console.log(test), 500);