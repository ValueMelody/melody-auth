exports.up = function (knex) {
  return knex('scope').insert([
    {
      name: 'read_org',
      type: 's2s',
      note: 'Allows a S2S app to access org-specific data without modifying it.',
    },
    {
      name: 'write_org',
      type: 's2s',
      note: 'Allows a S2S app to create, update, and delete org-specific data.',
    },
  ])
}

exports.down = function () {
}
