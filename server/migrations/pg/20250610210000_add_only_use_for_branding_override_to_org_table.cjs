exports.up = async function (knex) {
  return knex.schema.table(
    'org',
    function (table) {
      table.smallint('onlyUseForBrandingOverride').notNullable()
        .defaultTo(0)
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'org',
    function (table) {
      table.dropColumn('onlyUseForBrandingOverride')
    },
  )
}
