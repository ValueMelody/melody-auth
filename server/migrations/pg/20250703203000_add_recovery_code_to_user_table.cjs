exports.up = async function (knex) {
  return knex.schema.table(
    'user',
    function (table) {
      table.string(
        'recoveryCodeHash',
        100,
      )
        .defaultTo(null)
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'user',
    function (table) {
      table.dropColumn('recoveryCodeHash')
    },
  )
}
