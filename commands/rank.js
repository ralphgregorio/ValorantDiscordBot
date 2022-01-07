const { MessageEmbed, MessageAttachment } = require("discord.js");
const API = require('../ValorantAPI');
const DB = require('../db/userDatabase');
const util = require('../util/utility');
const { prefix } = require('../config/botConfig.json');

createEmbed = (rank, vUser) => {
    const imgAttach = new MessageAttachment('./rankPictures/'+rank.rank.replace(/\s/g, '').toLowerCase()+'.png');
        const rankEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Valorant Current Rank')
            .setThumbnail('attachment://'+rank.rank.replace(/\s/g, '').toLowerCase()+'.png')
            .setTimestamp()
            .addFields(
              {name: 'Username', value: vUser},
              {name: 'Current Rank', value: rank.rank, inline: true },
              {name: 'Current RR', value: rank.rr.toString(), inline: true },
            );
        return {embeds: [rankEmbed], files: [imgAttach]};

}


module.exports = {
  name: "rank",
  description: "Grabs current rank of specified player",
  usage: `or ${prefix}rank 'Name#Tagline'`,
  guildOnly: false,
  args: true,
  slash: true,
  permissions: {
    bot: [],
    user: [],
  },
  execute: async (message, args, client) => {

    console.log(`${message.member.user.tag} ran rank command`)

    try {
      
      if (args.length == 0){
          const data = await DB.getUser(message.member.user.id);
          if (data === null) return message.channel.send(util.createEmbedError(`If you don't have a linked account you must enter as ${prefix}rank name#tagline`));
          const rank = await API.getRank("na", data.puuid);
          return message.channel.send(createEmbed(rank, data.val_username));
      }

      const Vname = util.parseValoUserName(args);
      var tagline = Vname[1];
      var name = Vname[0];

      
      const puuid = await API.getPUUID(name, tagline);
      if (puuid === null) return message.channel.send(util.createEmbedError(`${name}#${tagline} is not a valid valorant username`));
      const rank = await API.getRank("na", puuid);
    
    return message.channel.send(createEmbed(rank, name+"#"+tagline));
    }
    catch(err){
      console.log({msg: "Error running rank command.", err: err})
      return message.channel.send(util.createEmbedError("Try again later"));
    }
  },
};