const cron = require("node-cron");
const dotenv = require("dotenv");
const { generateNewTask } = require("./task-generator");
const { sendMail } = require("./send-mail");
const connectToDB = require('./dbconfig');
const { taskGenerationScheduleStr, mailScheduleSchedueStr } = require("./config");

dotenv.config();

const supabase = connectToDB();

let dailyTask;

(async () => {
	dailyTask = await generateNewTask();
})();

const taskGeneratorSchedule = cron.schedule(taskGenerationScheduleStr, async () => {
	dailyTask = await generateNewTask();
});

const mailSchedule = cron.schedule(mailScheduleSchedueStr, async () => {
	try {
		if(!dailyTask) {
			throw("Task not generated yet");
		}
		const currentHour = new Date().getHours();
		const currentMinutes = new Date().getMinutes();
		const emailList = await getEmailList(currentHour, currentMinutes);
		emailList.forEach((email) => {
			sendMail(email, dailyTask.subject, dailyTask.content);
		});

	} catch (err) {
		console.log("Error :", err.message);
	}
},
	{
		timezone: "Asia/Kolkata"
	}
);

async function getEmailList(currentHour, currentMinutes) {
	const hourStr = String(currentHour).padStart(2, '0');
	const minuteStr = String(currentMinutes).padStart(2, '0');
	const timeToMatch = `${hourStr}:${minuteStr}`;
	console.log(timeToMatch);

	const { data, error } = await supabase
		.from('registered_mails')
		.select('email_id')
		.eq('preferredTime', timeToMatch);

	if (error) {
		throw new Error('DB Error: ' + error.message);
	}

	return data.map(obj => obj.email_id);
}

taskGeneratorSchedule.start();
mailSchedule.start();

process.stdin.resume();