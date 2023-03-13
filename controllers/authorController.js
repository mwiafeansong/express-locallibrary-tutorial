const Author = require('../models/author');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator');
const { findByIdAndRemove } = require('../models/author');

// display list of all authors
exports.author_list = (req, res, next) => {
  Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function (err, list_authors) {
      if (err) {
        return next(err);
      }
      res.render('author_list', {
        title: 'Author List',
        author_list: list_authors,
      });
    });
};

//display detail page for a specific author
exports.author_detail = (req, res, next) => {
  async.parallel(
    {
      author(callback) {
        Author.findById(req.params.id).exec(callback);
      },
      author_books(callback) {
        Book.find({ author: req.params.id }, 'title summary').exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.author == null) {
        const err = new Error('Author not found');
        err.status = 404;
        return next(err);
      }
      res.render('author_detail', {
        title: 'Author Detail',
        author: results.author,
        author_books: results.author_books,
      });
    }
  );
};

//display author create form on GET
exports.author_create_get = (req, res) => {
  res.render('author_form', { title: 'Create Author' });
};

//handle author create on POST
exports.author_create_post = [
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Family name must be specified')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body('date_of_death', 'Invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Create Author',
        author: req.body,
        errors: errors.array(),
      });
      return;
    }

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    author.save((err) => {
      if (err) return next(err);
      res.redirect(author.url);
    });
  },
];

//display author delete form on GET
exports.author_delete_get = (req, res, next) => {
  async.parallel(
    {
      author(callback) {
        Author.findById(req.params.id).exec(callback);
      },
      author_books(callback) {
        Book.find({ author: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.author == null) res.redirect('/catalog/authors');
      res.render('author_delete', {
        title: 'Delete Author',
        author: results.author,
        author_books: results.author_books,
      });
    }
  );
};

//handle author delete on POST
exports.author_delete_post = (req, res, next) => {
  async.parallel(
    {
      author(callback) {
        Author.findById(req.body.authorid).exec(callback);
      },
      author_books(callback) {
        Book.find({ author: req.body.authorid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);

      if (results.author_books.length > 0) {
        res.render('author_delete', {
          title: 'Delete Author',
          author: results.author,
          author_books: results.author_books,
        });
        return;
      }

      Author.findByIdAndRemove(req.body.authorid, (err) => {
        if (err) return next(err);
        res.redirect('/catalog/authors');
      });
    }
  );
};
//display author update form on GET
exports.author_update_get = (req, res, next) => {
  Author.findById(req.params.id, (err, result) => {
    if (err) return next(err);
    if (result == null) {
      const err = new Error('Author not found');
      err.status(404);
      return next(err);
    }
    res.render('author_form', {
      title: 'Update Author',
      author: result,
    });
  });
};

//handle author update on POST
exports.author_update_post = [
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Family name must be specified')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body('date_of_death', 'Invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Create Author',
        author: author,
        errors: errors.array(),
      });
      return;
    }

    Author.findByIdAndUpdate(req.params.id, author, {}, (err, theauthor) => {
      if (err) return next(err);
      res.redirect(theauthor.url);
    });
  },
];
