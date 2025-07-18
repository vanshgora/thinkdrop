const { GoogleGenAI } = require('@google/genai');

const prompt = `I want to increase my multi-dimensional knowledge like health, fashion, tech, engineering , drama, dj, writting, crowd word, public speaking, general intresing topics and any other dimension exsists no matter what.
So, Give me a random topic from any domain. Include:

    A clear explanation of the topic,

    A challenging task involving both learning and implementation,

    2–3 high-quality resources to understand and apply the topic.

    Format your response as json:
    { subject: "<subject of the email>", content: "<full content of the email in html>" }
     note: json must be correct, task can being completed in a day`

const AIModel = "gemini-2.5-flash";

async function generateNewTask() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let taskStr = "";

  do {
    console.log("request made");
    const response = await ai.models.generateContent({
      model: AIModel,
      contents: prompt,
    });

    taskStr = response.text.replace(/^```json\s*/, '').replace(/\s*```$/, '').replace(/\+\s*/g, "").replace(/"content":\s*"/, '"content": "');
  } while (!isValidJSON(taskStr));

  return JSON.parse(taskStr);
}

function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

module.exports = { generateNewTask };
