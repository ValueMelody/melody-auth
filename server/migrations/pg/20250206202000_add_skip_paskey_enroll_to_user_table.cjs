exports.up = async function (knex) {
  return knex.schema.table(
    'user',
    function (table) {
      table.smallint('skipPasskeyEnroll').notNullable()
        .defaultTo(0)
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'user',
    function (table) {
      table.dropColumn('skipPasskeyEnroll')
    },
  )
}
