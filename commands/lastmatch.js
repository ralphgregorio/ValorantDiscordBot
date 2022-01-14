const { MessageEmbed } = require("discord.js");
const API = require('../ValorantAPI');
const DB = require('../db/userDatabase');
const util = require('../util/utility');
const axios = require('axios');
const { prefix } = require('../config/botConfig.json');

module.exports = {
  name: "lastmatch",
  description: "Grabs stats about your last match. Must have a linked account",
  aliases: ["l"],
  usage: ``,
  guildOnly: false,
  args: false,
  slash: true,
  permissions: {
    bot: [],
    user: [],
  },
  execute: async (message, args, client) => {

    console.log(`${message.member.user.tag} ran lastmatch command`)

    try {
      message.channel.sendTyping();
      
      let color = "#00FF00";
      
      const data = await DB.getUser(message.member.user.id);
      if (data === null) return message.channel.send(util.createEmbedError(`use ${prefix}link command to link your account before using this command`));
      
      const matchDetails = await API.getCompHistory("na", data.puuid);
      const matchID = matchDetails.data[0].MatchID;
      const result = await API.getMatchDetails("na", matchID);

      let date = new Date(result.data.matchInfo.gameStartMillis);
      
      const playerDetails =  result.data.players.find(id => id.subject === data.puuid);
      const agentImg = await axios.get(`https://valorant-api.com/v1/agents/${playerDetails.characterId}`);
      const map = await axios.get(`https://valorant-api.com/v1/maps`);
      const mapDetails = map.data.data.find(id => id.mapUrl === result.data.matchInfo.mapId);
      const win = result.data.teams.find(team => team.teamId === playerDetails.teamId);
      if (win.won === false){
        color = "#FF0000";
      };
      let lostRound = result.data.teams[0].teamId !== win.teamId ? result.data.teams[0].roundsWon : result.data.teams[1].roundsWon;
      const matchEmbed = new MessageEmbed()
            .setColor(color)
            .setTitle(`Last Match Stats - ${mapDetails.displayName} - ${win.won === true ? "WIN" : "LOSE"}`)
            .setDescription(`${date.toUTCString()} | Score: ${win.roundsWon}-${lostRound}`)
            .setImage(mapDetails.listViewIcon)
            .setThumbnail(agentImg.data.data.displayIcon)
            .setTimestamp()
            .addFields(
              {name: 'Agent', value: agentImg.data.data.displayName, inline: true},
              {name: 'Kill', value: playerDetails.stats.kills.toString(), inline: true},
              {name: 'Death', value: playerDetails.stats.deaths.toString(), inline: true},
              {name: 'Score', value: playerDetails.stats.score.toString(), inline: true},
              {name: 'Assist', value: playerDetails.stats.assists.toString(), inline: true},
              {name: 'K/D Ratio', 
              value: (playerDetails.stats.kills/playerDetails.stats.deaths).toFixed(2).toString(), inline: true},
              {name: 'Match Rank', value: API.ranks[playerDetails.competitiveTier], inline: true},
            );
      return message.channel.send({embeds: [matchEmbed]});
    }
    catch(err) {
      console.log({msg: "Error running lastmatch command.", err: err})
      return message.channel.send(util.createEmbedError("Try again later"));
    }
  },
};