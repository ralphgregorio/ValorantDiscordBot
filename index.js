require('dotenv').config(); //initialize dotenv
const fs = require('fs');
const API = require('./ValorantAPI');
const {prefix} = require('./config/botConfig.json')
const { Client, Collection, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

function authorize() {
  console.log("Reauthorizing bot with private API...")
  API.authorize();
  setTimeout(authorize,3600000)
}

authorize();


for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);

  console.log(`${command.name} - command has been loaded`)
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(i18n.__("common.errorCommand")).catch(console.error);
  }
});


//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token