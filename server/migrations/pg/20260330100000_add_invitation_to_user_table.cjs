exports.up = async function (knex) {
  return knex.schema.table(
    'user',
    function (table) {
      table.string('invitationToken')
        .defaultTo(null)
      table.string(
        'invitationExpiresAt',
        19,
      )
        .defaultTo(null)
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'user',
    function (table) {
      table.dropColumn('invitationExpiresAt')
      table.dropColumn('invitationToken')
    },
  )
}
