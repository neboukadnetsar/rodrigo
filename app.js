const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const HttpError = require('./HttpError');

const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const crypto = require('crypto');

const userAccountQueries = require("./queries/UserAccountQueries");

const recetteRouter = require('./routes/recetteRouter');
const uniteRouter = require('./routes/uniteRouter');
const evaluationRouter = require('./routes/evaluationRouter');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

class BasicStrategyModified extends BasicStrategy {
  constructor(options, verify) {
    return super(options, verify);
  }

  _challenge() {
    return 'xBasic realm="' + this._realm + '"';
  }
}

passport.use(new BasicStrategyModified((username, password, cb) => {
  userAccountQueries.getLoginByUserAccountId(username).then(login => {
    if (!login || !login.isActive) {
      return cb(null, false);
    }

    const iterations = 100000;
    const keylen = 64;
    const digest = "sha512";

    crypto.pbkdf2(password, login.passwordSalt, iterations, keylen, digest, (err, hashedPassword) => {
      if (err) {
        return cb(err);
      }

      const passwordHashBuffer = Buffer.from(login.passwordHash, "base64");

      if (!crypto.timingSafeEqual(passwordHashBuffer, hashedPassword)) {
        return cb(null, false);
      }

      return cb(null, login);
    });
  }).catch(err => {
    return cb(err);
  });
}));

app.use('/recettes', recetteRouter);
app.use('/unites', uniteRouter);
app.use('/evaluations', evaluationRouter);

app.get('/login',
  passport.authenticate('basic', { session: false }),
  (req, res, next) => {
    if (req.user) {
      const userDetails = {
        userId: req.user.userId,
        userFullName: req.user.userFullName,
        isAdmin: req.user.isAdmin,
        isActive: req.user.isActive
      };

      res.json(userDetails);
    } else {
      return next({ status: 500, message: "Propriété user absente" });
    }
  }
);

app.post('/inscription', (req, res, next) => {
  const userId = req.body.userId;
  if(!userId || userId === ''){
    return next(new HttpError(400, 'Le champ userId est requis'));
  }

  const password = req.body.password;
  if(!password || passport === ''){
    return next(new HttpError(400, 'Le champ password est requis'));
  }

  const userFullName = req.body.userFullName;
  if(!userFullName || userFullName === ''){
    return next(new HttpError(400, 'Le champ fullname est requis'));
  }

  const salt = crypto.randomBytes(16).toString("base64");

  crypto.pbkdf2(password, salt, 100000, 64, "sha512", async (err, derivedKey) => {
    if(err){
      return next(err);
    }

    const passwordHashBase64 = derivedKey.toString("base64");

    try{
      const userAccountWithPasswordHash = await userAccountQueries.createUserAccount(userId, passwordHashBase64, salt, userFullName);

      const userDetails = {
        userId: userAccountWithPasswordHash.userId,
        userFullName: userAccountWithPasswordHash.userFullName,
        isAdmin: userAccountWithPasswordHash.isAdmin,
        isActive: userAccountWithPasswordHash.isActive
      };

      res.json(userDetails);
    } catch(err){
      return next(err);
    }
  });

});

// *** GESTION DES ERREURS ***
app.use((err, req, res, next) => {
  console.log("error handler: ", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500)
  if (err instanceof HttpError) {
    res.json(err.getJsonMessage());
  } else {
    res.json(err);
  }
});

module.exports = app;
