const express = require("express");
const router = express.Router();

const students = require("./students");
const auth = require("./auth");

router.get("/", function (req, res, next) {
  res.json({
    error: false,
    message: "Active",
  });
});

router.use("/students", students);
router.use("/auth", auth);

module.exports = router;
