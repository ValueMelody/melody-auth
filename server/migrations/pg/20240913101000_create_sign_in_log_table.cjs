exports.up = function (knex) {
  return knex.schema.createTable(
    'sign_in_log',
    function (table) {
      table.increments('id').primary()
      table.string(
        'ip',
        15,
      )
      table.text('detail')
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
  return knex.schema.dropTable('sign_in_log')
}
