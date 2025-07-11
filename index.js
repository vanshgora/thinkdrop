const cron = require("node-cron");
const dotenv = require("dotenv");
const { generateNewTask } = require("./task-generator");
const { sendMail } = require("./send-mail");

dotenv.config();

console.log(111);

const task = cron.schedule("0 50 10 * * *", async () => {
	try {
		const response = await generateNewTask();
		sendMail("vanshgora30@gmail.com", response.subject, response.content);
	} catch (err) {
		console.log("Error :", err.message);
	}
}
);