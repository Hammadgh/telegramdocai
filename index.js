const Telegram = require("node-telegram-bot-api");
const { Configuration, OpenAIApi } = require("openai");

const botToken = process.env.5834991530:AAFPkF-ez_kzqxB24jinf7r_EBUUgIpZcNc;
const openaiToken = process.env.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;

const config = new Configuration({
  apiKey: openaiToken,
});

const openai = new OpenAIApi(config);

const bot = new Telegram(botToken, { polling: true });

const userMedicalHistory = new Map();

let hasStarted = false;

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Hello! How can I help you today? Use the command '/aid' followed by your question to get started. To stop using the service, send me the '/stop' command.");
  hasStarted = true;
});

bot.onText(/\/ask/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "You can now send me simple text messages with your questions and I will respond as best I can. To stop using the service, send me the '/stop' command.");
  hasStarted = true;
});

bot.onText(/\/stop/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Thank You! If you need my assistance again in the future, send me the '/ask' command.");
  hasStarted = false;
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (!hasStarted) return;
  if (msg.text.toLowerCase().includes("who are you") || msg.text.toLowerCase().includes("what are you")) {
    bot.sendMessage(chatId, " medical related.");
    return;
  }

  let prompt = `${msg.text} behave as doctor psychiatrist or a friendly medical assistant`;

  // If user has a medical history, add it to the prompt
  if (userMedicalHistory.has(chatId)) {
    prompt = `${prompt} \n\nPrevious medical history: ${userMedicalHistory.get(chatId)} medical doctor psychiatrist`;
  }

  const reply = await openai.createCompletion({
    max_tokens: 100,
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.5,
  });

  let response = reply.data.choices[0].text;
  response = response.replace("As a doctor, I would recommend", "As a trusted medical professional, I recommend");
  response = response.replace("medical professional","take", "consider taking");
  response = response.replace("medical professional","prescribe", "suggest");
  response = response.replace("medical professional","medical treatment", "professional medical care");
  response = response.replace("medical professional","you should see a doctor", "it may be best to seek professional medical attention");
  response = response.replace("medical professional","you may want to", "it could be helpful to");
  response = response.replace("medical professional","you may consider", "it might be worth considering");
  bot.sendMessage(chatId, response);
});

// Keep the bot running continuously on Heroku
const http = require('http');
const port = process.env.PORT || 3000;
const server = http.createServer(() => {});
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
