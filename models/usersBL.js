const userSchema = require("./userModel");
const {switchDB, getDBModel} = require("../multiDatabaseHandler");

exports.getUserById =  (id) => {
  return new Promise(async (resolve, reject) => {
    //1) swtichDB to AppTenant
    const mainDB = await switchDB('MainDB', 'admins', userSchema)
    //2) create new admin user in AppTenant
    const adminModel = await getDBModel(mainDB, 'admins', userSchema)
    adminModel.findById(id).then(data => {
      if (data) {
        resolve(data);
      } else {
        const errorResponse = {
          error: true,
          message: `User with ID ${id} not found`,
        };
        reject(errorResponse);
      }
    })
        .catch(err => {
          const errorResponse = {
            error: true,
            message: `Error fetching user by ID ${id}`,
            details: err.message,
          };
          reject(errorResponse);
        });
  });
};

exports.getUserByEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    //1) swtichDB to AppTenant
    const mainDB = await switchDB('MainDB', 'admins', userSchema)
    //2) create new admin user in AppTenant
    const adminModel = await getDBModel(mainDB, 'admins', userSchema)
    adminModel.findOne({email: email}).then(data => {
      if (data) {
        resolve(data);
      } else {
        const errorResponse = {
          error: true,
          message: `User with ID ${email} not found`,
        };
        reject(errorResponse);
      }
    })
        .catch(err => {
          const errorResponse = {
            error: true,
            message: `Error fetching user by email ${email}`,
            details: err.message,
          };
          reject(errorResponse);
        });
  });
};
