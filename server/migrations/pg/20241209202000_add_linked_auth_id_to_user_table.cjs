exports.up = async function (knex) {
  return knex.schema.table(
    'user',
    function (table) {
      table.string(
        'linkedAuthId',
        36,
      )
        .defaultTo(null)
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'user',
    function (table) {
      table.dropColumn('linkedAuthId')
    },
  )
}
