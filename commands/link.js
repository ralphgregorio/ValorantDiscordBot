const API = require('../ValorantAPI');
const DB = require('../db/userDatabase');
const util = require('../util/utility')
const { prefix } = require('../config/botConfig.json');


module.exports = {
  name: "link",
  description: "Links your discord account with Valorant username and Tagline",
  usage: `Name#Tagline`,
  guildOnly: false,
  args: true,
  slash: true,
  permissions: {
    bot: [],
    user: [],
  },
  execute: async (message, args, client) => {

    console.log(`${message.member.user.tag} ran link command`)
      
      if (args.length == 0) return message.channel.send("Enter a valorant username to link");
      
      const Vname = util.parseValoUserName(args);
      var tagline = Vname[1];
      var name = Vname[0];
      
      const puuid = await API.getPUUID(name, tagline);
      if (puuid === null) return message.channel.send("Not a valid Valorant Username, please try again");

      const res = await DB.createUser(message.member.user.id, name+"#"+tagline, puuid, message.member.user.tag+message.member.id);

    return res === true ? message.author.send("Successfully Linked") : message.author.send(`Failed to link, try running ${prefix}unlink and try again.`) ;
  },
};