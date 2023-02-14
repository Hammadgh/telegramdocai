const Telegram = require("node-telegram-bot-api");
const { Configuration, OpenAIApi } = require("openai");

const botToken = "5834991530:AAFPkF-ez_kzqxB24jinf7r_EBUUgIpZcNc";
const openaiToken = "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";

const config = new Configuration({
  apiKey: openaiToken,
});

const openai = new OpenAIApi(config);

const bot = new Telegram(botToken, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome To AI ChatBot");
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  const reply = await openai.createCompletion({
    max_tokens: 100,
    model: "ada",
    prompt: msg.text,
    temperature: 0.5,
  });

  bot.sendMessage(chatId, reply.data.choices[0].text);
});
