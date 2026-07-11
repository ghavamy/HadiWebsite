import { Router } from "express";
import { sendSMS } from "../services/smsService.js";
import { sendEmail , sendWelcomeEmail } from "../services/emailService.js";
import { getDb } from "../database/database.js";
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

    const db = await getDb();

    // Check if password matches
    if (password !== confirmPassword) {
      req.flash('error', 'رمز عبور مطابقت ندارد');
      return res.redirect("/register");
    }

    // Check password length
    if (password.length < 6) {
      req.flash('error', 'رمز عبور باید حداقل ۶ کاراکتر باشد');
      return res.redirect("/register");
    }

    // ✅ Check if user exists - using db.get()
    const existingUser = await db.get(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [email, phone]
    );

    if (existingUser) {
      req.flash('error', 'این ایمیل یا شماره تلفن قبلاً ثبت شده است');
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert user - using db.run()
    const result = await db.run(
      `INSERT INTO users (fullName, phone, email, role, grade, field, password)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullName, phone, email, role, grade, field, hashedPassword]
    );

    try {
      await Promise.all([
        sendSMS(req.body),
        sendEmail(req.body),
        sendWelcomeEmail(req.body)
      ]);
    } catch (smsError) {
      console.error("SMS Error:", smsError);
    }

    const user = {
      id: result.lastID,  // ✅ Changed from lastInsertRowid to lastID
      fullName,
      role
    };

    req.session.user = user;
    req.flash('success', `خوش آمدید ${fullName}!`);
    res.redirect("/");

  } catch (err) {
    console.error(err);
    req.flash('error', 'خطا در ثبت نام. لطفاً دوباره تلاش کنید.');
    res.redirect("/register");
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const db = await getDb();

    // Validate inputs
    if (!email || !password) {
      req.flash('error', 'لطفاً ایمیل و رمز عبور را وارد کنید');
      return res.redirect("/register");
    }

    // ✅ Get user - using db.get()
    const user = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!user) {
      req.flash('error', 'کاربری با این ایمیل یافت نشد');
      return res.redirect("/register");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      req.flash('error', 'رمز عبور اشتباه است');
      return res.redirect("/register");
    }

    req.session.user = {
      id: user.id,
      fullName: user.fullName,
      role: user.role
    };

    req.flash('success', `خوش آمدید ${user.fullName}!`);
    res.redirect("/");

  } catch (err) {
    console.error(err);
    req.flash('error', 'خطا در ورود. لطفاً دوباره تلاش کنید.');
    res.redirect("/register");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default router;