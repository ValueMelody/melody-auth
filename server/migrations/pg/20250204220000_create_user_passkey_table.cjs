exports.up = function (knex) {
  return knex.schema.createTable(
    'user_passkey',
    function (table) {
      table.increments('id').primary()
      table.integer('userId')
        .notNullable()
      table.string('credentialId')
        .notNullable()
      table.text('publicKey')
        .notNullable()
      table.integer('counter')
        .notNullable()
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
      table.foreign('userId').references('id')
        .inTable('user')
    },
  )
}

exports.down = function (knex) {
  return knex.schema.dropTable('user_passkey')
}
