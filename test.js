const API = require(`./ValorantAPI`);
async function test() {
    //await API.authorize();
    const matchID = "1d04d894-7d73-479b-a591-4ab03e817720";
    const data1 = await API.getPUUID("NekCihC","9881");
    const res = await API.getRank("na", data1);
    const res2 = await API.getGameName("na", data1);
    const res3 = await API.getMatchDetails("na", matchID)
    console.log(res);
    console.log(res2);
    console.log(res3);
}
test();