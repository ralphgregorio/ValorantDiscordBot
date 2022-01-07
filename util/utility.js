module.exports = {
    parseValoUserName : (messageBody) => {
        if (messageBody.length != 1){
          var combined = messageBody.join(' ');
          return combined.split('#');
        } else {
          return messageBody[0].split('#');
        }
      }
}