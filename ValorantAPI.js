require('dotenv').config();
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const querystring = require('querystring');
const configs = require('./config/config.json');
const fs = require('fs');
const url = require('url');
axiosCookieJarSupport(axios);


createRequest = (url, method, data='') => {
    var data = data;
    var config = {
    method: method,
    url: url,
    headers: { 
        'X-Riot-Entitlements-JWT': `${configs.JWT}`, 
        'X-Riot-ClientPlatform': `${process.env.PLATFORM}`, 
        'X-Riot-ClientVersion': `${process.env.VERSION}`, 
        'Authorization': `Bearer ${configs.AUTH_TOKEN}`
    },
    data : data
    };

    return config;
},

rank_tier = {
    0: "Unranked",
    1: "Unranked",
    2: "Unranked",
    3: "Iron 1",
    4: "Iron 2",
    5: "Iron 3",
    6: "Bronze 1",
    7: "Bronze 2",
    8: "Bronze 3",
    9: "Silver 1",
    10: "Silver 2",
    11: "Silver 3",
    12: "Gold 1",
    13: "Gold 2",
    14: "Gold 3",
    15: "Platinum 1",
    16: "Platinum 2",
    17: "Platinum 3",
    18: "Diamond 1",
    19: "Diamond 2",
    20: "Diamond 3",
    21: "Immortal 1",
    22: "Immortal 2",
    23: "Immortal 3",
    24: "Radiant"
},

module.exports = {

    /**
     * Use external API to get PUUID of given name#tag
     * @param {String} name Player Name
     * @param {String} tag Player Tag
     * @returns PUUID returned
     */
    getPUUID: async (name, tag) => {
        const url = `https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`;
        const response = await axios.get(url).catch(err => {return null;});
        return (response != null) ? response.data.data.puuid : null;
    },

    /**
     * Creates new Authentication Token and AWT for API requests to private API
     */
    authorize: async () => {

        const cookieJar = new tough.CookieJar();

        await axios.post('https://auth.riotgames.com/api/v1/authorization', {
            'client_id': 'play-valorant-web-prod',
            'nonce': '1',
            'redirect_uri': 'https://playvalorant.com/opt_in',
            'response_type': 'token id_token',
        }, {
            jar: cookieJar,
            withCredentials: true,
        });
        const response = await axios.put('https://auth.riotgames.com/api/v1/authorization', {
            'type': 'auth',
            'username': process.env.USER,
            'password': process.env.PASS,
        }, {
            jar: cookieJar,
            withCredentials: true,
        });
        // check for error
        if (response.data.error) {
            throw new Error(response.data.error);
        }
        // parse uri
        var parsedUrl = url.parse(response.data.response.parameters.uri);
        // strip # from hash
        var hash = parsedUrl.hash.replace('#', '');
        // parse query string from hash
        var parts = querystring.parse(hash);
        const access_token = parts.access_token;
        const response_1 = await axios.post('https://entitlements.auth.riotgames.com/api/token/v1', {}, {
            jar: cookieJar,
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
        });
        console.log(`Successfully reauthorized with ${process.env.USER}`);
        const data = { AUTH_TOKEN: access_token, JWT: response_1.data.entitlements_token };
        fs.writeFile('./config/config.json', JSON.stringify(data), err => {
            if (err) {
                console.log("Failed to assign new JWT and Auth Token");
            } else {
                console.log("Successfully assigned new JWT and Auth Token");
            }
        });
    },


    /**
     * Grabs players rank details
     * @param {String} region - Choose from regions na | eu | ap | kr
     * @param {String} puuid - PUUID of player
     * @returns Player rank
     */
    getRank: async (region, puuid) => {
        const url = `https://pd.${region}.a.pvp.net/mmr/v1/players/${puuid}/competitiveupdates?queue=competitive`;
        const response = await axios(createRequest(url, "GET")).catch(err => {return err;})
        return response.data !== undefined 
        ? {success: true, tier:response.data.Matches[0].TierAfterUpdate, 
            rank:rank_tier[response.data.Matches[0].TierAfterUpdate], last_rr_earned: response.data.Matches[0].RankedRatingEarned, 
        rr: response.data.Matches[0].RankedRatingAfterUpdate, 
        totalRR: response.data.Matches[0].TierAfterUpdate*100+response.data.Matches[0].RankedRatingAfterUpdate} 
        : {success: false, error: response.response.statusText};
    },

    /**
     * Grabs name of specified PUUID
     * @param {String} region - Choose from regions na | eu | ap | kr
     * @param {String} puuid - PUUID of player
     * @returns Name of PUUID
     */
    getGameName: async (region, puuid) => {
        const url = `https://pd.${region}.a.pvp.net/name-service/v2/players`;
        const response = await axios(createRequest(url,"PUT",[puuid]));
        return response.data !== undefined ? {success: true, data: response.data[0]} : {success: false, data: {}};
    },

    /**
     * Grabs list of matchID's of competitive matches played by puuid
     * @param {String} region - Choose from regions na | eu | ap | kr
     * @param {String} puuid - PUUID of player
     * @returns List of matchID's
     */
    getCompHistory: async (region, puuid) => {
        const url = `https://pd.${region}.a.pvp.net/match-history/v1/history/${puuid}?queue=competitive`;
        const response = await axios(createRequest(url,"GET"));
        return response.data !== undefined ? {success: true, data:response.data.History} : {success:false, data:{}};
    },

    /**
     * Grabs full info of specified match
     * @param {String} region - Choose from regions na | eu | ap | kr
     * @param {String} mID - Match ID of match
     * @returns Full match info
     */
    getMatchDetails: async (region, mID) => {
        const url = `https://pd.${region}.a.pvp.net/match-details/v1/matches/${mID}`;
        const response = await axios(createRequest(url, "GET"));
        return response.data !== undefined ? 
        {success: true, data:response.data} : {success:false, data:{}};
    },

}