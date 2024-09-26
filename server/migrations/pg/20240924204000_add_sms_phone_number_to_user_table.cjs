exports.up = async function (knex) {
  return knex.schema.table(
    'user',
    function (table) {
      table.string(
        'smsPhoneNumber',
        20,
      ).defaultTo(null)
      table.smallint('smsPhoneNumberVerified').defaultTo(0)
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'user',
    function (table) {
      table.dropColumn('smsPhoneNumber')
      table.dropColumn('smsPhoneNumberVerified')
    },
  )
}
