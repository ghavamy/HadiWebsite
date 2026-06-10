const axios = require("axios");

async function sendSMS(data) {

    const message =
        `نام: ${data.fullName}
        تلفن: ${data.phone}
        ایمیل: ${data.email}
        نقش: ${data.role}
        پایه: ${data.grade || "-"}
        رشته: ${data.field || "-"}`;

    console.log("sending SMS....");

    const response = await axios.post(
        "https://niksms.com/fa/publicapi/ptpSms",
        new URLSearchParams({

            username: process.env.NIKSMS_USERNAME,
            password: process.env.NIKSMS_PASSWORD,

            "GroupSmsModel.Message": message,
            "GroupSmsModel.Numbers": process.env.ADMIN_PHONE,
            "GroupSmsModel.SendType": "1",
            "GroupSmsModel.SenderNumber": "",

        }).toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );

    console.log("response", response.data);

    return response.data;
}

module.exports = { sendSMS };