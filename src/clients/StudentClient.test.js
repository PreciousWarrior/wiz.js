import auth from "../data/auth";
import Student from "../clients/StudentClient";

let student;

jest.setTimeout(150000);
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
