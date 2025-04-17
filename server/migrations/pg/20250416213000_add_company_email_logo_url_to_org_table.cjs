exports.up = async function (knex) {
  return knex.schema.table(
    'org',
    function (table) {
      table.string('companyEmailLogoUrl').notNullable()
        .defaultTo('')
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'org',
    function (table) {
      table.dropColumn('companyEmailLogoUrl')
    },
  )
}
