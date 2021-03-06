const Discord = require("discord.js");
const { prefix } = require('../config/botConfig.json');


module.exports = {
  name: "help",
  description: "Get help on how to use the bot and the specific commands",
  aliases: ["?", "h"],
  usage: "[command name]",
  guildOnly: false,
  args: false,
  slash: true,
  permissions: {
    bot: [],
    user: [],
  },
  execute: async (message, args, client) => {
    console.log(`${message.member.user.tag} ran help command`)

    try {
    const { commands } = message.client;

    if (!args.length) {
      const cmdHelpEmbed = new Discord.MessageEmbed()
        .setTitle("**HELP**")
        .setDescription(
          `Command list: \n\`${commands
            .map((command) => command.name)
            .join(
              " | "
            )}\`\nYou can use \`${prefix}help {command name}\` to get info about a specific command!`
        )
      return message.channel.send({
        embeds: [cmdHelpEmbed],
      });
    }

    const name = args[0].toLowerCase();
    const command =
      commands.get(name) ||
      commands.find((cmd) => cmd.aliases && cmd.aliases.includes(name));

    if (!command) {
      const cmdDoesntExist = new Discord.MessageEmbed()
        .setTitle("Command not found!")
        .setDescription(
          'Command "' +
            message.arg +
            "\" doesn't exist!\nUse `" +
            prefix +
            "help` for list of all commands."
        )
      return message.channel.send({
        embeds: [cmdDoesntExist],
      });
    }
    const cmdHelpEmbed = new Discord.MessageEmbed()
      .setTitle(`${command.name} | Command info`)
      .setDescription(command.description)
      .addField("Usage", `\`${prefix + command.name} ${command.usage}\``, true)

    if (command.aliases) {
      cmdHelpEmbed.addField(
        "Aliases",
        `\`${command.aliases.join(" | ")}\``,
        true
      );
    }

    return message.channel.send({ embeds: [cmdHelpEmbed] });
  }
  catch (err) {
    console.log({msg: "Error running help command.", err: err})
    return message.channel.send(util.createEmbedError("Try again later"));
  }
  },
};