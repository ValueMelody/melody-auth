exports.up = function (knex) {
  return knex.schema.createTable(
    'scope',
    function (table) {
      table.increments('id').primary()
      table.string(
        'name',
        50,
      ).notNullable()
      table.string(
        'type',
        3,
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
        CREATE UNIQUE INDEX idx_unique_scope_name
        ON "scope" ("name")
        WHERE "deletedAt" IS NULL;
      `)
    })
    .then(function () {
      return knex('scope').insert([
        {
          name: 'openid',
          type: 'spa',
          note: '',
        },
        {
          name: 'profile',
          type: 'spa',
          note: '',
        },
        {
          name: 'offline_access',
          type: 'spa',
          note: '',
        },
        {
          name: 'root',
          type: 's2s',
          note: 'Allows a S2S app to perform any action and access all data endpoints within the API.',
        },
        {
          name: 'read_user',
          type: 's2s',
          note: 'Allows a S2S app to access user-specific data without modifying it.',
        },
        {
          name: 'write_user',
          type: 's2s',
          note: 'Allows a S2S app to create, update, and delete user-specific data.',
        },
        {
          name: 'read_app',
          type: 's2s',
          note: 'Allows a S2S app to access app-specific data without modifying it.',
        },
        {
          name: 'write_app',
          type: 's2s',
          note: 'Allows a S2S app to create, update, and delete app-specific data.',
        },
        {
          name: 'read_scope',
          type: 's2s',
          note: 'Allows a S2S app to access scope-specific data without modifying it.',
        },
        {
          name: 'write_scope',
          type: 's2s',
          note: 'Allows a S2S app to create, update, and delete scope-specific data.',
        },
        {
          name: 'read_role',
          type: 's2s',
          note: 'Allows a S2S app to access role-specific data without modifying it.',
        },
        {
          name: 'write_role',
          type: 's2s',
          note: 'Allows a S2S app to create, update, and delete role-specific data.',
        },
      ])
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('scope')
}
