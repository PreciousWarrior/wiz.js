import auth from '../data/auth'
import Client from './BaseClient'

const delay = (ms) => new Promise((res) => setTimeout(res, ms))
jest.setTimeout(15000)

test('Should convert time to Unix Timestamp', () => {
    expect(Client.convertTimeToUnixTimestamp('20:05', false)).toBe(72300000)
    expect(Client.convertTimeToUnixTimestamp('12:00 AM')).toBe(0)
    expect(Client.convertTimeToUnixTimestamp('12:00 PM')).toBe(43200000)
})

test('Should convert wordy date to Unix Timestamp', () => {
    expect(Client.convertWordyDateToUnixTimestamp('16-Aug-2021')).toBe(
        1629072000000,
    )
    expect(Client.convertWordyDateToUnixTimestamp('1/Jan/1999', '/')).toBe(
        915148800000,
    )
})

test('Client should get correct user information', async () => {
    const client = new Client(auth)
    const info = await client.getUserInfo()
    expect(info.name).toBe(auth.name)
    expect(info.gender).toBe(auth.gender)
    expect(info.type).toBe(auth.type)
})

test('Client should throw wrong password error', async () => {
    const client = new Client({
        email: auth.email,
        password: 'XDXDXD',
        school: auth.school,
        type: auth.type,
    })
    await expect(client.getUserInfo()).rejects.toThrow('INCORRECT_PASSWORD')
})

/**
 * Takes a lot of time
 test("Client should refresh cookie", async () => {
  const COOKIE_REFRESH_RATE = 3;
  const client = new Client(auth, 1000 * COOKIE_REFRESH_RATE);
  await client.request();
  const previousCookie = client.cookie;
  await delay(1000 * COOKIE_REFRESH_RATE);
  const newCookie = client.cookie;
  expect(newCookie !== previousCookie);
});
 */
