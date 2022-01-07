const { MessageEmbed, MessageAttachment } = require("discord.js");
module.exports = {
    parseValoUserName : (messageBody) => {
        if (messageBody.length != 1){
          var combined = messageBody.join(' ');
          return combined.split('#');
        } else {
          return messageBody[0].split('#');
        }
      },
    createEmbedError : (msg) => {
        const imgAttach = new MessageAttachment('./rankPictures/null.png');
        const rankEmbed = new MessageEmbed()
              .setColor('#FF0000')
              .setTitle('Exception')
              .setThumbnail('attachment://null.png')
              .setTimestamp()
              .addFields(
                {name: 'Error', value: msg},
              );
        return {embeds: [rankEmbed], files: [imgAttach]};
    
    },
}