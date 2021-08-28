const auth = require("../data/auth");
const Student = require("./StudentClient");

const student = new Student(auth);

test("Tests if meetings object is returned correctly", async () => {
  //TODO
  const meetings = await student.getMeetings();
});

test("Should return class information", async () => {
  //TODO
  const classInfo = await student.getClass(11614);
});
