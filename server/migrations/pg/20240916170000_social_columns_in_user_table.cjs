exports.up = async function (knex) {
  await knex.schema.table(
    'user',
    function (table) {
      table.renameColumn(
        'googleId',
        'socialAccountId',
      )
      table.string(
        'socialAccountType',
        10,
      ).defaultTo(null)
    },
  )

  await knex('user')
    .whereNotNull('socialAccountId')
    .update({ socialAccountType: 'Google' })
}

exports.down = async function (knex) {
  await knex.schema.table(
    'user',
    function (table) {
      table.renameColumn(
        'socialAccountId',
        'googleId',
      )
      table.dropColumn('socialAccountType')
    },
  )
}
