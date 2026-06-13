const axios = require('axios');

async function sendSMS(student) {

    const text =
        `دانش آموز جدید:
نام: ${student.fullName}
موبایل: ${student.phone}
پایه: ${student.grade}`;

    await axios.get(
        `https://api.kavenegar.com/v1/${process.env.KAVENEGAR_API_KEY}/sms/send.json`,
        {
            params: {
                receptor: process.env.ADMIN_PHONE,
                message: text
            }
        }
    );

}

module.exports = sendSMS;