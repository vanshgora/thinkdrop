const cron = require("node-cron");
const dotenv = require("dotenv");
const { generateNewTask } = require("./task-generator");
const { sendMail } = require("./send-mail");
const connectToDB = require('./dbconfig');
const { taskGenerationScheduleStr, mailScheduleSchedueStr, IndianTimezone } = require("./config");

dotenv.config();

let database;

connectToDB.then((val) => {
	database = val;
})

let dailyTask;

(async () => {
	dailyTask = await generateNewTask();
	sendMail('vanshgora31@gmail.com', dailyTask.subject, dailyTask.content);
})();

const taskGeneratorSchedule = cron.schedule(taskGenerationScheduleStr, async () => {
	dailyTask = await generateNewTask();
}, {
	timezone: IndianTimezone
});

const mailSchedule = cron.schedule(mailScheduleSchedueStr, async () => {
	try {
		if (!dailyTask) {
			throw ("Task not generated yet");
		}
		const nowUTC = new Date();
		const istTime = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000));
		const currentHour = istTime.getHours();
		const currentMinutes = istTime.getMinutes();
		const emailList = await getEmailList(currentHour, currentMinutes);
		emailList.forEach((email) => {
			sendMail(email, dailyTask.subject, dailyTask.content);
		});

	} catch (err) {
		console.log("Error :", err.message);
	}
},
	{
		timezone: IndianTimezone
	}
);

async function getEmailList(currentHour, currentMinutes) {
	try {
		const hourStr = String(currentHour).padStart(2, '0');
		const minuteStr = String(currentMinutes).padStart(2, '0');
		const timeToMatch = `${hourStr}:${minuteStr}`;

		const users = database.collection('users');

		const data = users.find({ 'preferredTime': timeToMatch });

		const emailArr = [];

		for await (const obj of data) {
			emailArr.push(obj.email);
		}

		return emailArr;
	} catch (err) {
		console.log("Error while fetching data from db", err);
	}
}

taskGeneratorSchedule.start();
mailSchedule.start();

process.stdin.resume();