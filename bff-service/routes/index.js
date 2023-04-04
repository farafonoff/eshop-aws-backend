var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Express",
    cartApi: process.env.cart_api,
    productApi: process.env.product_api,
  });
});

module.exports = router;
