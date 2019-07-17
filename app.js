const app = require("./express");

// load .env variables
require('dotenv').config();
port = process.env.PORT;

// start node server
app.listen(port, () => {
  console.log("App started on port " + port);
});
