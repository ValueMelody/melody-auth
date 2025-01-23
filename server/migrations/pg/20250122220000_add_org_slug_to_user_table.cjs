exports.up = async function (knex) {
  return knex.schema.table(
    'user',
    function (table) {
      table.string(
        'orgSlug',
        50,
      ).notNullable()
        .defaultTo('')
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'user',
    function (table) {
      table.dropColumn('orgSlug')
    },
  )
}
