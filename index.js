const Telegram = require("node-telegram-bot-api");
const { Configuration, OpenAIApi } = require("openai");

const botToken = "5834991530:AAFPkF-ez_kzqxB24jinf7r_EBUUgIpZcNc";
const openaiToken = "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";

const config = new Configuration({
  apiKey: openaiToken,
});

const openai = new OpenAIApi(config);

const bot = new Telegram(botToken, { polling: true });

const userMedicalHistory = new Map();

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Hi there! I'm Dr. AI, and I'm here to listen and support you with your medical concerns. What's on your mind today?");
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  let prompt = msg.text;

  // If user has a medical history, add it to the prompt
  if (userMedicalHistory.has(chatId)) {
    prompt = `${prompt} \n\nPrevious medical history: ${userMedicalHistory.get(chatId)}`;
  }

  const reply = await openai.createCompletion({
    max_tokens: 300,
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.5,
  });

  // Update user's medical history
  if (reply.data.choices[0].text.toLowerCase().startsWith("update medical history")) {
    userMedicalHistory.set(chatId, reply.data.choices[0].text.slice(22));
  } else {
    let response = reply.data.choices[0].text;
    response = response.replace("As a doctor, I would recommend", "As a medical professional, I suggest");
    response = response.replace("take", "consider taking");
    response = response.replace("prescribe", "recommend");
    response = response.replace("medical treatment", "professional medical attention");
    response = response.replace("you should see a doctor", "it's important to seek professional medical attention");
    response = response.replace("you may want to", "it could be helpful to");
    response = response.replace("you may consider", "it might be worth considering");
    bot.sendMessage(chatId, response);
  }
});
