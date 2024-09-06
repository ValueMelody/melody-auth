exports.up = function (knex) {
  return knex.schema.createTable(
    'role',
    function (table) {
      table.increments('id').primary()
      table.string(
        'name',
        50,
      ).notNullable()
      table.string('note').notNullable()
        .defaultTo('')
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
    .then(function () {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX idx_unique_role_name
        ON "role" ("name")
        WHERE "deletedAt" IS NULL;
      `)
    })
    .then(function () {
      return knex('role').insert([
        {
          name: 'super_admin',
          note: 'Grants a user full access to the admin panel',
        },
      ])
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('role')
}
