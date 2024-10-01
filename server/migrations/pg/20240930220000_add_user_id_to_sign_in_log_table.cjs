exports.up = async function (knex) {
  return knex.schema.table(
    'sign_in_log',
    function (table) {
      table.integer('userId').notNullable()
        .defaultTo(0)
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'sign_in_log',
    function (table) {
      table.dropColumn('userId')
    },
  )
}
