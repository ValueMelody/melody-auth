exports.up = function (knex) {
  return knex.schema.createTable(
    'user_attribute',
    function (table) {
      table.increments('id').primary()
      table.string('name')
        .notNullable()
        .unique()
      table.boolean('includeInSignUpForm')
        .notNullable()
        .defaultTo(false)
      table.boolean('requiredInSignUpForm')
        .notNullable()
        .defaultTo(false)
      table.boolean('includeInIdTokenBody')
        .notNullable()
        .defaultTo(false)
      table.boolean('includeInUserInfo')
        .notNullable()
        .defaultTo(false)
      table.string(
        'createdAt',
        19,
      ).notNullable()
        .defaultTo(knex.raw("to_char(current_timestamp, 'YYYY-MM-DD HH24:MI:SS')"))
      table.string(
        'updatedAt',
        19,
      ).notNullable()
        .defaultTo(knex.raw("to_char(current_timestamp, 'YYYY-MM-DD HH24:MI:SS')"))
      table.string(
        'deletedAt',
        19,
      ).defaultTo(null)
    },
  )
}

exports.down = function (knex) {
  return knex.schema.dropTable('user_attribute')
}
