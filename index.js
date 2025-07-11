const cron = require("node-cron");
const dotenv = require("dotenv");
const { generateNewTask } = require("./task-generator");
const { sendMail } = require("./send-mail");

dotenv.config();

console.log(new Date().toLocaleString())

const task = cron.schedule("0 30 7 * * *", async () => {
	try {
		const response = await generateNewTask();
		sendMail("vanshgora30@gmail.com", response.subject, response.content);
	} catch (err) {
		console.log("Error :", err.message);
	}
},
	{
		timezone: "Asia/Kolkata"
	}
);

process.stdin.resume();