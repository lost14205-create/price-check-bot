const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const API_URL = process.env.API_URL;

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const item = message.content.trim();

  try {
    const res = await fetch(`${API_URL}?item=${encodeURIComponent(item)}`);
    const data = await res.json();

    if (data.error) {
      message.reply("Item not found");
    } else {
      // ✅ UPDATED RESPONSE
      message.reply(
        `${data.item} price range is ${data.min} - ${data.max} (last updated: ${data.lastUpdate})`
      );
    }
  } catch (err) {
    console.error(err);
    message.reply("Error contacting API");
  }
});

client.login(TOKEN);
