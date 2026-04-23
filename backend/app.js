const express  = require('express');
const cookieParser = require('cookie-parser');
const { engine } = require('express-handlebars');

publicApp.engine('handlebars', engine({
  defaultLayout: 'public',                             // views/layouts/public.handlebars
  extname:       '.handlebars',
  layoutsDir:    path.join(__dirname, 'views/layouts'),
  partialsDir:   path.join(__dirname, 'views/partials'),
  helpers: hbsHelpers,
}));