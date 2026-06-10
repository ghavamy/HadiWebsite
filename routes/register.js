const express = require("express");
const router = express.Router();
const { sendSMS } = require("../utils/smsService");

// GET register page
router.get("/", (req, res) => {
  res.render("register", {
    title: "ثبت نام / ورود",
    courseCss: true,
    fontAwesome: true
  });
});


router.post("/", async (req, res) => {
    try {

        console.log(req.body);

        await sendSMS(req.body);

        res.send("اطلاعات با موفقیت ارسال شد.");

    } catch (err) {

        console.error(err);

        res.status(500).send("خطا در ارسال اطلاعات.");

    }
});

module.exports = router;