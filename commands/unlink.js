const Discord = require("discord.js");
const API = require('../ValorantAPI');
const DB = require('../db/userDatabase');
const { prefix } = require('../config/botConfig.json');


module.exports = {
  name: "unlink",
  description: "Unlinks your discord account to currently linked Valorant Account",
  usage: ``,
  guildOnly: false,
  args: false,
  slash: true,
  permissions: {
    bot: [],
    user: [],
  },
  execute: async (message, args, client) => {

    console.log(`${message.member.user.tag} ran unlink command`)

    try {
     
      const id = message.member.user.id;
      const res = await DB.getUser(id);
      if (res != null){
        DB.deleteUser(id);
      }
      
    return res != null ? message.author.send(`Successfully unlinked with ${res.val_username}`) : message.author.send(`Failed to unlink, you have not linked an account.`) ;
    } 
    catch(err){
      console.log({msg: "Error running unlink command.", err: err})
      return message.channel.send(util.createEmbedError("Try again later"));
    }
  },
};