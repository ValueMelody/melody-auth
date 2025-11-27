exports.up = async function (knex) {
  return knex.schema.table(
    'user_attribute',
    function (table) {
      table.smallint('unique')
        .notNullable()
        .defaultTo(0)
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'user_attribute',
    function (table) {
      table.dropColumn('unique')
    },
  )
}
