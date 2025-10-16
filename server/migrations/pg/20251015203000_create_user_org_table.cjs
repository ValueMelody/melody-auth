exports.up = function (knex) {
  return knex.schema.createTable(
    'user_org',
    function (table) {
      table.increments('id').primary()
      table.integer('userId')
        .notNullable()
      table.integer('orgId')
        .notNullable()
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
      table.foreign('userId').references('id')
        .inTable('user')
      table.foreign('orgId').references('id')
        .inTable('org')
    },
  )
    .then(function () {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX idx_unique_user_org
        ON "user_org" ("userId", "orgId")
        WHERE "deletedAt" IS NULL;
      `)
    })
    .then(async function () {
      const users = await knex('user')
        .select('id', 'orgSlug')
        .where('orgSlug', '!=', '')
        .whereNotNull('orgSlug')
        .whereNull('deletedAt')

      const orgs = await knex('org')
        .select('id', 'slug')
        .whereNull('deletedAt')

      const orgMap = new Map(orgs.map(org => [org.slug, org.id]))

      const timestamp = knex.raw("to_char(current_timestamp, 'YYYY-MM-DD HH24:MI:SS')")
      const insertData = []
      
      for (const user of users) {
        const orgId = orgMap.get(user.orgSlug)
        if (orgId) {
          insertData.push({
            userId: user.id,
            orgId,
            createdAt: timestamp,
            updatedAt: timestamp
          })
        }
      }

      if (insertData.length > 0) {
        return knex('user_org').insert(insertData)
      }
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('user_org')
}

