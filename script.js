const fs = require("node:fs/promises");
const { getDb } = require("./dbconfig");

async function getEmailList(currentHour, currentMinutes) {
    try {
        const hourStr = String(currentHour).padStart(2, '0');
        const minuteStr = String(currentMinutes).padStart(2, '0');
        const timeToMatch = `${hourStr}:${minuteStr}`;

        const database = getDb();

        const users = database.collection('users');

        const data = users.find({ 'preferredTime': timeToMatch });

        const emailArr = [];

        for await (const obj of data) {
            if (!obj.isServicePaused);
            emailArr.push(obj.email);
        }

        return emailArr;
    } catch (err) {
        console.log("Error while fetching data from db", err);
    }
}

async function getResponseStrucrure() {

    return new Promise(async (resolve, reject) => {
        try {

            filePath = "responseStructue.json";
            const fileHandler = fs.open(filePath, "r");
            const readStream = (await fileHandler).createReadStream();

            let content = "";

            readStream.on("data", (chunk) => {
                content += chunk;
            })

            readStream.on('end', () => {
                resolve(content);
            })
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

module.exports = {
    getResponseStrucrure,
    getEmailList
}