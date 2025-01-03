exports.up = function (knex) {
  return knex.schema.createTable(
    'org',
    function (table) {
      table.increments('id').primary()
      table.string(
        'name',
        50,
      ).notNullable()
      table.string('companyLogoUrl', 250).notNullable()
        .defaultTo('')
      table.string('fontFamily', 50).notNullable()
        .defaultTo('')
      table.string('fontUrl', 250).notNullable()
        .defaultTo('')
      table.string('layoutColor', 20).notNullable()
        .defaultTo('')
      table.string('labelColor', 20).notNullable()
        .defaultTo('')
      table.string('primaryButtonColor', 20).notNullable()
        .defaultTo('')
      table.string('primaryButtonLabelColor', 20).notNullable()
        .defaultTo('')
      table.string('primaryButtonBorderColor', 20).notNullable()
        .defaultTo('')
      table.string('secondaryButtonColor', 20).notNullable()
        .defaultTo('')
      table.string('secondaryButtonLabelColor', 20).notNullable()
        .defaultTo('')
      table.string('secondaryButtonBorderColor', 20).notNullable()
        .defaultTo('')
      table.string('criticalIndicatorColor', 20).notNullable()
        .defaultTo('')
      table.string('emailSenderName', 20).notNullable()
        .defaultTo('')
      table.string('termsLink', 250).notNullable()
        .defaultTo('')
      table.string('privacyPolicyLink', 250).notNullable()
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
        CREATE UNIQUE INDEX idx_unique_org_name
        ON "org" ("name")
        WHERE "deletedAt" IS NULL;
      `)
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('org')
}
