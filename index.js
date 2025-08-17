const cron = require("node-cron");
const dotenv = require("dotenv");
const { generateNewTask } = require("./task-generator");
const { sendMail } = require("./send-mail");
const { connectToDB, getDb } = require('./dbconfig');
const { taskGenerationScheduleStr, mailScheduleSchedueStr, IndianTimezone } = require("./config");
const { getEmailList } = require("./script");

dotenv.config();

const startService = async () => {

	await connectToDB();

	let dailyTask;

	(async () => {
		dailyTask = (await generateNewTask());
		const database = getDb();
		const taskCollection = database.collection('tasks');
		await taskCollection.insertOne({ ...dailyTask, createdAt: new Date() });
		sendMail('vanshgora31@gmail.com', dailyTask.email.subject, dailyTask.email.content);
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

	taskGeneratorSchedule.start();
	mailSchedule.start();

	process.stdin.resume();
}

startService();