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
		const task = await taskCollection.insertOne({ ...dailyTask, createdAt: new Date() });
		const taskId = task.insertedId;
		const usersCollection = database.collection('users');
		const users = await usersCollection.find();
		const taskTrackArr = dailyTask.topic.task.map(t => false);
		const today = new Date();
		const date = today.getDate();
		const month = today.getMonth();
		const year = today.getFullYear();

		const dateStr = `${date}/${month}/${year}`;

		const userTasks = database.collection('usertasks');
		for await (const obj of users) {
			const userId = obj._id;
			const data = await userTasks.findOne({ userId: userId });
			if (!data) {
				const tasks = {};
				const tasktrackObj = {};
				tasktrackObj.taskId = taskId;
				tasktrackObj.taskTrack = taskTrackArr;
				tasks[dateStr] = tasktrackObj;
				await userTasks.insertOne({ userId: userId, tasks: tasks, createdAt: new Date(), updatedAt: new Date() });
			} else {
				const tasks = data.tasks;
				const tasktrackObj = {};
				tasktrackObj.taskId = taskId;
				tasktrackObj.taskTrack = taskTrackArr;
				tasks[dateStr] = tasktrackObj;
				await userTasks.findOneAndUpdate({ userId: userId }, { $set: { userId: userId, tasks: tasks, updatedAt: new Date() } }, { new: true });
			}
		}
		sendMail('vanshgora31@gmail.com', dailyTask.email.subject, dailyTask.email.content);
	})();

	const taskGeneratorSchedule = cron.schedule(taskGenerationScheduleStr, async () => {
		dailyTask = await generateNewTask();
		const database = getDb();
		const taskCollection = database.collection('tasks');
		const task = await taskCollection.insertOne({ ...dailyTask, createdAt: new Date() });
		const taskId = task.insertedId;
		const usersCollection = database.collection('users');
		const users = await usersCollection.find();
		const taskTrackArr = dailyTask.topic.task.map(t => false);
		const today = new Date();
		const date = today.getDate();
		const month = today.getMonth();
		const year = today.getFullYear();

		const dateStr = `${date}/${month}/${year}`;

		const userTasks = database.collection('usertasks');
		for await (const obj of users) {
			const userId = obj._id;
			const data = await userTasks.findOne({ userId: userId });
			if (!data) {
				const tasks = {};
				const tasktrackObj = {};
				tasktrackObj.taskId = taskId;
				tasktrackObj.taskTrack = taskTrackArr;
				tasks[dateStr] = tasktrackObj;
				await userTasks.insertOne({ userId: userId, tasks: tasks, createdAt: new Date(), updatedAt: new Date() });
			} else {
				const tasks = data.tasks;
				const tasktrackObj = {};
				tasktrackObj.taskId = taskId;
				tasktrackObj.taskTrack = taskTrackArr;
				tasks[dateStr] = tasktrackObj;
				await userTasks.findOneAndUpdate({ userId: userId }, { $set: { userId: userId, tasks: tasks, updatedAt: new Date() } }, { new: true });
			}
		}
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