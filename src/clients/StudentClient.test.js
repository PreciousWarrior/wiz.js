import auth from '../data/auth'
import Student from '../clients/StudentClient'
jest.setTimeout(15000)

let student
beforeAll(async () => {
    student = await Student.build(auth)
})

test('Tests if meetings object is returned correctly', async () => {
    //TODO
    await student.getMeetings()
})

test('Should return class information', async () => {
    //TODO
    await student.getClass(11614)
})
