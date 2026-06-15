import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {

    if (error) {
        console.error("SMTP ERROR:", error);
    } else {
        console.log("SMTP READY");
    }

});

export async function sendEmail(data)
{
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: "ثبت نام جدید در سایت",

        html: `
            <h2>کاربر جدید ثبت نام کرد</h2>

            <p><strong>نام:</strong> ${data.fullName}</p>
            <p><strong>تلفن:</strong> ${data.phone}</p>
            <p><strong>ایمیل:</strong> ${data.email}</p>
            <p><strong>نقش:</strong> ${data.role}</p>
            <p><strong>پایه:</strong> ${data.grade || "-"}</p>
            <p><strong>رشته:</strong> ${data.field || "-"}</p>
        `
    };

    return transporter.sendMail(mailOptions);
}

export async function sendWelcomeEmail(data)
{
    return transporter.sendMail({
        from: `" آموزشگاه پلی نو" <${process.env.EMAIL_USER}>`,
        to: data.email,

        subject: "ثبت نام شما با موفقیت انجام شد",

        html: `
            <h2>${data.fullName} عزیز</h2>

            <p>
                ثبت نام شما در سامانه آموزشگاه با موفقیت انجام شد.
            </p>

            <p>
                به جمع دانش‌آموزان پلی نو خوش آمدید 🌹
            </p>
        `
    });
}