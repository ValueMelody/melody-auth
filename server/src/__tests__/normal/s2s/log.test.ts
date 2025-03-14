import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Scope } from 'shared'
import app from 'index'
import { routeConfig } from 'configs'
import {
  mockedKV,
  migrate,
  mock,
} from 'tests/mock'
import {
  attachIndividualScopes,
  dbTime, getS2sToken,
} from 'tests/util'
import {
  emailLogModel, signInLogModel, smsLogModel,
} from 'models'

let db: Database

const insertEmailLogs = async () => {
  await db.exec(`
    INSERT INTO "email_log"
    (receiver, success, response, content)
    values ('test@email.com', 1, 'response 1', 'content 1')
  `)
  await db.exec(`
    INSERT INTO "email_log"
    (receiver, success, response, content)
    values ('test@email.com', 1, 'response 2', 'content 2')
  `)
  await db.exec(`
    INSERT INTO "email_log"
    (receiver, success, response, content)
    values ('test1@email.com', 1, 'response 3', 'content 3')
  `)
  await db.exec(`
    INSERT INTO "email_log"
    (receiver, success, response, content)
    values ('test1@email.com', 0, 'response 4', 'content 4')
  `)
  await db.exec(`
    INSERT INTO "email_log"
    (receiver, success, response, content)
    values ('test2@email.com', 1, 'response 5', 'content 5')
  `)
}

const emailLogs = [
  {
    id: 1,
    receiver: 'test@email.com',
    success: true,
    response: 'response 1',
    content: 'content 1',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
  {
    id: 2,
    receiver: 'test@email.com',
    success: true,
    response: 'response 2',
    content: 'content 2',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
  {
    id: 3,
    receiver: 'test1@email.com',
    success: true,
    response: 'response 3',
    content: 'content 3',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
  {
    id: 4,
    receiver: 'test1@email.com',
    success: false,
    response: 'response 4',
    content: 'content 4',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
  {
    id: 5,
    receiver: 'test2@email.com',
    success: true,
    response: 'response 5',
    content: 'content 5',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
]

const insertSmsLogs = async () => {
  await db.exec(`
    INSERT INTO "sms_log"
    (receiver, success, response, content)
    values ('+6471231111', 1, 'response 1', 'content 1')
  `)
  await db.exec(`
    INSERT INTO "sms_log"
    (receiver, success, response, content)
    values ('+6471231111', 1, 'response 2', 'content 2')
  `)
  await db.exec(`
    INSERT INTO "sms_log"
    (receiver, success, response, content)
    values ('+6471231112', 1, 'response 3', 'content 3')
  `)
  await db.exec(`
    INSERT INTO "sms_log"
    (receiver, success, response, content)
    values ('+6471231112', 0, 'response 4', 'content 4')
  `)
  await db.exec(`
    INSERT INTO "sms_log"
    (receiver, success, response, content)
    values ('+6471231113', 1, 'response 5', 'content 5')
  `)
}

const smsLogs = [
  {
    id: 1,
    receiver: '+6471231111',
    success: true,
    response: 'response 1',
    content: 'content 1',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
  {
    id: 2,
    receiver: '+6471231111',
    success: true,
    response: 'response 2',
    content: 'content 2',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
  {
    id: 3,
    receiver: '+6471231112',
    success: true,
    response: 'response 3',
    content: 'content 3',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
  {
    id: 4,
    receiver: '+6471231112',
    success: false,
    response: 'response 4',
    content: 'content 4',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
  {
    id: 5,
    receiver: '+6471231113',
    success: true,
    response: 'response 5',
    content: 'content 5',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
]

const insertSignInLogs = async () => {
  await db.exec(`
    INSERT INTO "sign_in_log"
    ("userId", ip, detail)
    values (1, '1-1-1-1', 'detail 1')
  `)
  await db.exec(`
    INSERT INTO "sign_in_log"
    ("userId", ip, detail)
    values (1, '1-1-1-1', 'detail 2')
  `)
  await db.exec(`
    INSERT INTO "sign_in_log"
    ("userId", ip, detail)
    values (1, '1-1-1-2', 'detail 3')
  `)
  await db.exec(`
    INSERT INTO "sign_in_log"
    ("userId", ip, detail)
    values (2, '1-1-1-3', 'detail 4')
  `)
  await db.exec(`
    INSERT INTO "sign_in_log"
    ("userId", ip, detail)
    values (3, '1-1-1-4', 'detail 5')
  `)
}

const signInLogs = [
  {
    id: 1,
    userId: 1,
    ip: '1-1-1-1',
    detail: 'detail 1',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
  {
    id: 2,
    userId: 1,
    ip: '1-1-1-1',
    detail: 'detail 2',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
  {
    id: 3,
    userId: 1,
    ip: '1-1-1-2',
    detail: 'detail 3',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
  {
    id: 4,
    userId: 2,
    ip: '1-1-1-3',
    detail: 'detail 4',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
  {
    id: 5,
    userId: 3,
    ip: '1-1-1-4',
    detail: 'detail 5',
    createdAt: dbTime,
    updatedAt: dbTime,
    deletedAt: null,
  },
]

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await mockedKV.empty()
  await db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiLogs

describe(
  'get all emailLogs',
  () => {
    test(
      'should return all emailLogs',
      async () => {
        await insertEmailLogs()

        const res = await app.request(
          `${BaseRoute}/email`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          logs: emailLogs,
          count: 5,
        })
      },
    )

    test(
      'could get email logs by pagination',
      async () => {
        await insertEmailLogs()

        const res = await app.request(
          `${BaseRoute}/email?page_size=3&page_number=1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          logs: [emailLogs[0], emailLogs[1], emailLogs[2]],
          count: 5,
        })

        const res1 = await app.request(
          `${BaseRoute}/email?page_size=2&page_number=2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json1 = await res1.json()
        expect(json1).toStrictEqual({
          logs: [emailLogs[2], emailLogs[3]],
          count: 5,
        })
      },
    )

    test(
      'should not return log with non root scope',
      async () => {
        await insertEmailLogs()
        await attachIndividualScopes(db)

        const res = await app.request(
          `${BaseRoute}/email`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)
      },
    )
  },
)

describe(
  'get emailLog by id',
  () => {
    test(
      'should return emailLog by id 1',
      async () => {
        await insertEmailLogs()

        const res = await app.request(
          `${BaseRoute}/email/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        const json = await res.json() as { log: emailLogModel.Record }
        expect(json.log).toStrictEqual(emailLogs[0])
      },
    )

    test(
      'should return emailLog by id 2',
      async () => {
        await insertEmailLogs()

        const res = await app.request(
          `${BaseRoute}/email/2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { log: emailLogModel.Record }
        expect(json.log).toStrictEqual(emailLogs[1])
      },
    )

    test(
      'should return 404 when can not find email log by id',
      async () => {
        const res = await app.request(
          `${BaseRoute}/email/6`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        expect(res.status).toBe(404)
      },
    )
  },
)

describe(
  'get all smsLogs',
  () => {
    test(
      'should return all smsLogs',
      async () => {
        await insertSmsLogs()

        const res = await app.request(
          `${BaseRoute}/sms`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          logs: smsLogs,
          count: 5,
        })
      },
    )

    test(
      'could get sms logs by pagination',
      async () => {
        await insertSmsLogs()

        const res = await app.request(
          `${BaseRoute}/sms?page_size=3&page_number=1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          logs: [smsLogs[0], smsLogs[1], smsLogs[2]],
          count: 5,
        })

        const res1 = await app.request(
          `${BaseRoute}/sms?page_size=2&page_number=2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json1 = await res1.json()
        expect(json1).toStrictEqual({
          logs: [smsLogs[2], smsLogs[3]],
          count: 5,
        })
      },
    )

    test(
      'should not return log with non root scope',
      async () => {
        await insertSmsLogs()
        await attachIndividualScopes(db)

        const res = await app.request(
          `${BaseRoute}/sms`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)
      },
    )
  },
)

describe(
  'get smsLog by id',
  () => {
    test(
      'should return smsLog by id 1',
      async () => {
        await insertSmsLogs()

        const res = await app.request(
          `${BaseRoute}/sms/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        const json = await res.json() as { log: smsLogModel.Record }
        expect(json.log).toStrictEqual(smsLogs[0])
      },
    )

    test(
      'should return smsLog by id 2',
      async () => {
        await insertSmsLogs()

        const res = await app.request(
          `${BaseRoute}/sms/2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { log: smsLogModel.Record }
        expect(json.log).toStrictEqual(smsLogs[1])
      },
    )

    test(
      'should return 404 when can not find sms log by id',
      async () => {
        const res = await app.request(
          `${BaseRoute}/sms/6`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        expect(res.status).toBe(404)
      },
    )
  },
)

describe(
  'get all signInLogs',
  () => {
    test(
      'should return all signInLogs',
      async () => {
        await insertSignInLogs()

        const res = await app.request(
          `${BaseRoute}/sign-in`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          logs: signInLogs,
          count: 5,
        })
      },
    )

    test(
      'could get sign-in logs by pagination',
      async () => {
        await insertSignInLogs()

        const res = await app.request(
          `${BaseRoute}/sign-in?page_size=3&page_number=1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          logs: [signInLogs[0], signInLogs[1], signInLogs[2]],
          count: 5,
        })

        const res1 = await app.request(
          `${BaseRoute}/sign-in?page_size=2&page_number=2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json1 = await res1.json()
        expect(json1).toStrictEqual({
          logs: [signInLogs[2], signInLogs[3]],
          count: 5,
        })
      },
    )

    test(
      'should not return log with non root scope',
      async () => {
        await insertSignInLogs()
        await attachIndividualScopes(db)

        const res = await app.request(
          `${BaseRoute}/sign-in`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)
      },
    )
  },
)

describe(
  'get signInLog by id',
  () => {
    test(
      'should return signInLog by id 1',
      async () => {
        await insertSignInLogs()

        const res = await app.request(
          `${BaseRoute}/sign-in/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        const json = await res.json() as { log: signInLogModel.Record }
        expect(json.log).toStrictEqual(signInLogs[0])
      },
    )

    test(
      'should return signInLog by id 2',
      async () => {
        await insertSignInLogs()

        const res = await app.request(
          `${BaseRoute}/sign-in/2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { log: signInLogModel.Record }
        expect(json.log).toStrictEqual(signInLogs[1])
      },
    )

    test(
      'should return 404 when can not find sign-in log by id',
      async () => {
        const res = await app.request(
          `${BaseRoute}/sign-in/6`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        expect(res.status).toBe(404)
      },
    )
  },
)
