const USER = require('./schemas/userSchema');
const mongo = require('./mongo');
const res = require('express/lib/response');

module.exports = {
    createUser: async (id, vUser, puuid, username) => {
        const data = {
            "_id": id,
            "val_username": vUser,
            "puuid": puuid,
            "username": username
        };
    
        const response = await mongo().then( async (mongoose) => {
            try {
                await USER.create(data);
                console.log(`createUser() : ${username} linked with ${vUser}`);
                return true;
            } 
            catch(err) {
                console.log({message: `createUser() : ${username} failed to link with ${vUser}`, error: err});
                return false;
            }
            finally {
                mongoose.connection.close();
            }
                    
        });
    
        return response;
    
    },

    getUser: async (id) => {
        const response = await mongo().then( async (mongoose) => {
            try {
                const data = await USER.findOne({"_id": id});
                console.log(`getUser() : grabbed ${data.val_username} from database`);
                return data;
            } 
            catch(err) {
                console.log(`getUser() : failed to grab ${id} from database`);
                return null;
            }
            finally {
                mongoose.connection.close();
            }
                    
        });
    
        return response;

    },

    deleteUser: async (id) => {
        await mongo().then( async (mongoose) => {
            try {
                await USER.deleteOne({"_id": id});
                console.log(`deleteUser() : ${id}: is deleted from database`);
                return true;
            } 
            catch(err) {
                console.log(`deleteUser() : failed to delete ${id} from database`);
                return false;
            }
            finally {
                mongoose.connection.close();
            }
                    
        });

    },


}