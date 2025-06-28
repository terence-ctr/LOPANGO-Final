/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // This migration was already applied but the file was lost.
  // This is an empty placeholder to satisfy Knex.
  return Promise.resolve();
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Since the 'up' migration is a placeholder, 'down' can also be one.
  return Promise.resolve();
};
