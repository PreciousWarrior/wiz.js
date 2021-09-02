# wiz.js

A library to interact with the wizemen API.

## What is this and why does it exist?

Our school uses an extremely garbage website in order to have us join meetings, view our grades, etc. Therefore, I decided to make this library to create some projects that will allow me (and others) to access the wizemen API, abstracting away all the quirks and bad design of the wizemen API (at least I try to). Using this library, I plan to make projects such as SchoolPresence (to show your current subject as a discord rich presence), as well as perhaps a wizemen desktop or mobile application in the future.

## [Documentation](https://preciouswarrior.github.io/wiz.js/)

## Installation

### To use the library

#### Prerequisites

Before using this library, you will need at least a basic understanding of JavaScript, as well as a basic understanding of node.js and modules. You will need a code editor or IDE (preferably VSCode as I have only tested intellisense on vscode), and the latest version of node and NPM.

1. On an initialized package, run-: `npm i @preciouswarrior/wiz.js --save`. If you use yarn, run `yarn add @preciouswarrior/wiz.js`.
2. Import the package wherever you want using CommonJS syntax.

### To develop for the library

1. Clone the repository-: `git clone https://github.com/PreciousWarrior/wiz.js.git && cd wiz.js`
2. Install dependencies including dev dependencies-: `yarn install --dev`
3. Make changes to any files and commit changes
4. Create a pull request

The master branch contains code in development, and the version number is incremented, documentation is generated, and package is added to the NPM repos when the code is ready to be used.

## Getting started

```js
const Wizemen = require("@preciouswarrior/wiz.js");

Wizemen.Student.build({
  email: "hello.world@pathways.in",
  password: "password123supersecure",
  school: "PSN",
})
  .then(student => {
    student
    .getMeetings()
    .then((meetings) =>
      console.log(meetings.map((meeting) => meeting.url).join("\n"))
    );
  })
  .catch(error => {
    console.log(error.message)
  });

```

This piece of code will show all your zoom and teams meetings in the console!

## Alternatives

### .NET

https://github.com/DhrumanGupta/Wizemen.NET
