const auth = require("../data/auth");
const Student = require("./StudentClient");

let student;

beforeAll(async () => {
  student = await Student.build(auth);
});

test("Tests if meetings object is returned correctly", async () => {
  //TODO
  const meetings = await student.getMeetings();
});

test("Should return class information", async () => {
  //TODO
  const classInfo = await student.getClass(11614);
});
