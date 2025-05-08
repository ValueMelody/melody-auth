exports.up = async function (knex) {
  return knex.schema.table(
    'org',
    function (table) {
      table.smallint('allowPublicRegistration').notNullable()
        .defaultTo(1)
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'org',
    function (table) {
      table.dropColumn('allowPublicRegistration')
    },
  )
}
