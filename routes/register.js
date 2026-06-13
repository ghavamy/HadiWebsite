import { Router } from "express";
import { sendSMS } from "../services/smsService.js";
import { sendEmail , sendWelcomeEmail } from "../services/emailService.js";
import db from "../database/database.js";
import bcrypt from "bcrypt";

const router = Router();

// GET register page
router.get("/", (req, res) => {
  res.render("register", {
    title: "ثبت نام / ورود",
    courseCss: true,
    fontAwesome: true
  });
});

// REGISTER
router.post("/", async (req, res) => {
  try {

    const {
      fullName,
      phone,
      email,
      role,
      grade,
      field,
      password,
      confirmPassword
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).send("رمز عبور مطابقت ندارد");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare(`
      INSERT INTO users
      (
        fullName,
        phone,
        email,
        role,
        grade,
        field,
        password
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      fullName,
      phone,
      email,
      role,
      grade,
      field,
      hashedPassword
    );

    try 
    {

      await Promise.all([
        sendSMS(req.body),
        sendEmail(req.body),
        sendWelcomeEmail(req.body)
      ]);

    } catch (smsError) 
    {
      console.error("SMS Error:", smsError);
    }

    const user = {
      id: result.lastInsertRowid,
      fullName,
      role
    };

    req.session.user = user;

    res.redirect("/");

  } catch (err) {
    console.error(err);
    res.status(500).send("خطا در ثبت کاربر");
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try 
  {

    const { email, password } = req.body;

    const stmt = db.prepare(
      "SELECT * FROM users WHERE email = ?"
    );

    const user = stmt.get(email);

    if (!user)
    {
      return res.status(401).send("کاربر یافت نشد");
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) 
    {
      return res.status(401).send("رمز عبور اشتباه است");
    }

    req.session.user = {
        id: user.id,
        fullName: user.fullName,
        role: user.role
    };

    res.redirect("/");

  } catch (err) 
  {
    console.error(err);
    res.status(500).send("خطا در ورود");
  }
});

router.get("/logout", (req, res) => {

  req.session.destroy(() => {

    res.redirect("/");

  });

});

export default router;