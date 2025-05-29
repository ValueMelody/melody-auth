exports.up = async function (knex) {
  return knex.schema.table(
    'user_attribute',
    function (table) {
      table.string('locales').notNullable()
        .defaultTo('')
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'user_attribute',
    function (table) {
      table.dropColumn('locales')
    },
  )
}
