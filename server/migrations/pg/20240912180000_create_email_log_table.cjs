exports.up = function (knex) {
  return knex.schema.createTable(
    'email_log',
    function (table) {
      table.increments('id').primary()
      table.smallint('success').notNullable()
      table.string('receiver').notNullable()
      table.text('response').notNullable()
      table.text('content').notNullable()
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
}

exports.down = function (knex) {
  return knex.schema.dropTable('email_log')
}
