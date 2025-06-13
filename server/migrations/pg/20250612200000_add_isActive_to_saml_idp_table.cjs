exports.up = async function (knex) {
  return knex.schema.table(
    'saml_idp',
    function (table) {
      table.smallint('isActive').notNullable()
        .defaultTo(1)
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'saml_idp',
    function (table) {
      table.dropColumn('isActive')
    },
  )
}
