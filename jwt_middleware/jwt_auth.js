const jwt = require('jsonwebtoken');

// export the jws middleware
module.exports = (req, res, next) => {
  // receive the token in the request header
  // header follows convention: Bearer_token
  // so we split the header by space and pick the 2nd element
  // ... use try/catch as it is not sure we have an auth header
  // ... as well check whether token is valid -- if not, go to error block
  try {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, 'secret_this_should_be_longer'); // verify token with jwt
    next(); // step out and continue
  } catch (error) {
    res.status(401).json({message: 'User is not authenticated!'});
  }
}
