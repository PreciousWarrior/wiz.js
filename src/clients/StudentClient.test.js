const auth = require("../data/auth");
const Student = require("./StudentClient");

const student = new Student(auth);

test("Tests if meetings object is returned correctly", async () => {
  //TODO
  const meetings = await student.getMeetings();
});
