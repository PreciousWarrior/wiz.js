# wiz.js
A library to interact with the wizemen API

## What is this and why does it exist?
Our school uses an extremely garbage website in order to have us join meetings, view our grades, etc. Therefore, I decided to make this library to create some projects that will allow me (and others) to access the wizemen API, abstracting away all the quirks and bad design of the wizemen API (at least I try to). Using this library, I plan to make projects such as SchoolPresence (to show your current subject as a discord rich presence), as well as perhaps a wizemen desktop or mobile application in the future.

## [Documentation](https://preciouswarrior.github.io/wiz.js/)

## Installation

### For personal use
**Right now the NPM package is still on a very old version, please wait for a day or two for me to test everything and publish the updated package to NPM**
1. On an initialized package, run-: `npm i @preciouswarrior/wiz.js --save`
2. Use the package in your project (import it via ES6 and not CommonJS, either set your package type to module or set your file name to `.mjs`.

### To develop for the library
1. Clone the repository-: `git clone https://github.com/PreciousWarrior/wiz.js.git && cd wiz.js`
2. Install dependencies INCLUDING DEV DEPENDENCIES `yarn install --dev`
3. Make changes to any files and commit changes
4. Create a pull request

The master branch contains code in development, and the version number is incremented, documentation is generated, and package is added to the NPM repos when the code is ready to be used.

## Getting started
```js
import { Student } from "@preciouswarrior/wiz.js";
const student = new Student({email: "hello.world@pathways.in", password: "password123supersecure", school: 0});
student.getMeetings().then(meetings=>console.log(meetings.map(meeting=>meeting.url).join("\n")))
```
This piece of code will show all your zoom meetings in the console!


## Alternatives
### .NET
https://github.com/DhrumanGupta/Wizemen.NET
