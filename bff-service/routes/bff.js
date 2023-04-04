var express = require("express");
var fetch = require("node-fetch");
var router = express.Router();

/* GET home page. */
router.all("/:service/*", async function (req, res, next) {
  const baseUrl = process.env[req.params.service];
  console.log(`${baseUrl}${req.params[0]}`);
  const response = await fetch(`${baseUrl}${req.params[0]}`, {
    method: req.method,
    body: req.method === "GET" ? undefined : JSON.stringify(req.body),
    headers: {
      authorization: req.headers.authorization,
    },
  });
  const respBody = await response.json();
  res.send({
    bffMeta: {
      baseUrl,
      method: req.method,
      url: req.url,
      params: req.params,
      body: JSON.stringify(req.body),
    },
    ...respBody,
  });
});

module.exports = router;
