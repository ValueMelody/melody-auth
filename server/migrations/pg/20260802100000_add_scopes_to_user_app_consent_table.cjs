exports.up = async function (knex) {
  return knex.schema.table(
    'user_app_consent',
    function (table) {
      table.text('scopes')
        .notNullable()
        .defaultTo('["openid","profile","offline_access"]')
    },
  )
}

exports.down = async function (knex) {
  return knex.schema.table(
    'user_app_consent',
    function (table) {
      table.dropColumn('scopes')
    },
  )
}
