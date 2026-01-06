exports.up = async function (knex) {
  return knex.schema.table(
    'user_attribute',
    function (table) {
      table.string('validationRegex')
        .notNullable()
        .defaultTo('')
      table.string('validationLocales')
        .notNullable()
        .defaultTo('')
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'user_attribute',
    function (table) {
      table.dropColumn('validationLocales')
      table.dropColumn('validationRegex')
    },
  )
}
