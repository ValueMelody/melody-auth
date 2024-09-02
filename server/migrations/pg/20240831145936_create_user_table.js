exports.up = function (knex) {
  return knex.schema.createTable(
    'user',
    function (table) {
      table.increments('id').primary()
      table.string(
        'authId',
        36,
      ).notNullable()
      table.string('email').defaultTo(null)
      table.string('googleId').defaultTo(null)
      table.string('password')
      table.string(
        'firstName',
        50,
      ).defaultTo(null)
      table.string(
        'lastName',
        50,
      ).defaultTo(null)
      table.string('otpSecret').notNullable()
        .defaultTo('')
      table.string('mfaTypes').notNullable()
        .defaultTo('')
      table.smallint('otpVerified').notNullable()
        .defaultTo(0)
      table.smallint('emailVerified').notNullable()
        .defaultTo(0)
      table.smallint('isActive').notNullable()
        .defaultTo(1)
      table.integer('loginCount').notNullable()
        .defaultTo(0)
      table.string(
        'locale',
        5,
      ).notNullable()
        .defaultTo('en')
      table.string(
        'createdAt',
        19,
      ).notNullable()
        .defaultTo(knex.raw("to_char(current_timestamp, 'YYYY-MM-DD HH24:MI:SS')"))
      table.string(
        'updatedAt',
        19,
      ).notNullable()
        .defaultTo(knex.raw("to_char(current_timestamp, 'YYYY-MM-DD HH24:MI:SS')"))
      table.string(
        'deletedAt',
        19,
      ).defaultTo(null)
    },
  )
    .then(function () {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX idx_unique_user_authId
        ON "user" ("authId")
        WHERE "deletedAt" IS NULL;
      `)
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('user')
}
