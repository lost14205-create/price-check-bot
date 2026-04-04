const { 
  Client, 
  GatewayIntentBits 
} = require('discord.js');

const fetch = require('node-fetch'); // remove if Node 18+

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;
const API_URL = process.env.API_URL;

client.on('interactionCreate', async (interaction) => {

  // ✅ AUTOCOMPLETE
  if (interaction.isAutocomplete()) {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    try {
      const res = await fetch(`${API_URL}?q=${encodeURIComponent(focusedValue)}`);
      const data = await res.json();

      const choices = data
        .map(item => item.item)
        .slice(0, 25);

      await interaction.respond(
        choices.map(choice => ({ name: choice, value: choice }))
      );

    } catch (err) {
      console.error(err);
    }
  }

  // ✅ SLASH COMMAND
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'p') {
    const item = interaction.options.getString('item');

    try {
      const res = await fetch(`${API_URL}?item=${encodeURIComponent(item)}`);
      const data = await res.json();

      if (data.error) {
        return interaction.reply({
          content: "Item not found",
          ephemeral: true
        });
      }

      return interaction.reply(
        `${data.item} price range is ${data.min} - ${data.max} (last updated: ${data.lastUpdate})`
      );

    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "Error contacting API",
        ephemeral: true
      });
    }
  }
});

client.login(TOKEN);
