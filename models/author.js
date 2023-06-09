const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, maxLength: 100, required: true },
  family_name: { type: String, maxLength: 100, required: true },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's ful name
AuthorSchema.virtual('name').get(function () {
  let fullname = '';

  if (this.first_name && this.family_name) {
    fullname = this.first_name + ' ' + this.family_name;
  }

  if (!this.first_name || !this.family_name) {
    fullname = '';
  }

  return fullname;
});

// Virtual for author's URL
AuthorSchema.virtual('url').get(function () {
  return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual('date_of_birth_formatted').get(function () {
  return this.date_of_birth
    ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED)
    : '';
});

AuthorSchema.virtual('date_of_death_formatted').get(function () {
  return this.date_of_death
    ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
    : '';
});

AuthorSchema.virtual('lifespan').get(function () {
  const dateOfBirth = this.date_of_birth
    ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED)
    : '';
  const dateOfDeath = this.date_of_death
    ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
    : '';

  return dateOfBirth + ' - ' + dateOfDeath;
});

AuthorSchema.virtual('date_of_birth_reformed').get(function () {
  return this.date_of_birth
    ? DateTime.fromJSDate(this.date_of_birth).toISODate()
    : '';
});

AuthorSchema.virtual('date_of_death_reformed').get(function () {
  return this.date_of_death
    ? DateTime.fromJSDate(this.date_of_death).toISODate()
    : '';
});

module.exports = mongoose.model('Author', AuthorSchema);
