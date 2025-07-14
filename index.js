const cron = require("node-cron");
const dotenv = require("dotenv");
const { generateNewTask } = require("./task-generator");
const { sendMail } = require("./send-mail");
const connectToDB = require('./dbconfig');

dotenv.config();

const supabase = connectToDB();

const task = cron.schedule("0 30 7 * * *", async () => {
	try {
		const response = await generateNewTask();
		const emailList = await getEmailList();
		emailList.forEach((email) => {
			sendMail(email, response.subject, response.content);
		});

	} catch (err) {
		console.log("Error :", err.message);
	}
},
	{
		timezone: "Asia/Kolkata"
	}
);

async function getEmailList() {
	const { data, error } = await supabase.from('registered_mails').select('*');
	if (error) {
		throw ('DB Error: ' + ' ' + error);
	}

	const emailList = data.map(obj => obj.email_id);
	return emailList;
}

task.start();

process.stdin.resume();