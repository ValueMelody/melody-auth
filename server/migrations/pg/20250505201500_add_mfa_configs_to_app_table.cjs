exports.up = async function (knex) {
  return knex.schema.table(
    'app',
    function (table) {
      table.smallint('useSystemMfaConfig').notNullable()
        .defaultTo(1)
      table.smallint('requireEmailMfa').notNullable()
        .defaultTo(0)
      table.smallint('requireOtpMfa').notNullable()
        .defaultTo(0)
      table.smallint('requireSmsMfa').notNullable()
        .defaultTo(0)
      table.smallint('allowEmailMfaAsBackup').notNullable()
        .defaultTo(0)
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'app',
    function (table) {
      table.dropColumn('useSystemMfaConfig')
      table.dropColumn('requireEmailMfa')
      table.dropColumn('requireOtpMfa')
      table.dropColumn('requireSmsMfa')
      table.dropColumn('allowEmailMfaAsBackup')
    },
  )
}
