const connectDB = require('./connectDB')
const TenantSchema= require ('./models/tenantSchema.js')
const EmployeeSchema= require ('./models/employeeSchema.js')
const userSchema = require('./models/userModel')
const logSchema = require('./models/logModel')
const ruleSchema = require('./models/ruleModel')
const catchAsync = require('./utils/catchAsync')
// Indicates which Schemas are used by whom
const CompanySchemas = new Map([['employee', userSchema]])
const TenantSchemas = new Map([['admins', userSchema]])


/** @description switch db on same connection pool,
 * @return new db connection
 * @params dbName, collection name, collection schema
 * @author Mustafa Shama
 */
const switchDB = async (dbName,collectionName,  dbSchema) => {
    const mongoose = await connectDB()

    if (mongoose.connection.readyState === 1) {
        const conn =await mongoose.connection;
        //make new company database else connect to existed db
        const db = await conn.useDb(dbName, { useCache:true, noListener: true })
        let collections = db.collection(collectionName);
        collections.count().then((count) => {
            console.log(count);
        });

        //1st approach
        // Prevent from schema re-registration
        if (collections.length === 0) {
            //create new collection
            dbSchema.forEach((schema, modelName) => {
                db.model(modelName, schema)
            })
        }
        //2nd approach
        // if (!db.model(collectionName,dbSchema)) {
        //     //create new collection
        //     dbSchema.forEach((schema, modelName) => {
        //         db.model(modelName, schema)
        //     })
        // }
        return db //return the new company db
    }
    throw new Error('switchDB')
}


//getDBModel will allow us to get the registered model for our db.
/**@parameters database, collection name, schema for collection
 * @return collection from mongoose, incase not existent, make new collection
 */
const getDBModel = async (database, modelName, schema) => {
    return database.model(modelName, schema) // create/get new collection (modelName)  into company(db) with
}


/** @description on signup, handle new db connection and make
 * new db in company name + employee collections
 * @return true if sucessed
 * @params adminModel(UserSchema), AdminData upon signup
 * @author Mustafa Shama
 */
const onSignupNewDatabase = async (adminModel,adminSchema, adminData) =>{
    return new Promise(async (resolve, reject) => {
    try{
        //1) swtichDB to AppTenant
        //  const tenantDB = await switchDB('MainDB', TenantSchemas);
        //2) create new admin user in AppTenant
        // const tenantModel = await getDBModel(tenantDB, 'admins');//point to tenant collection
        await adminModel.create(adminData);//creating admin in mainDB(AppTenants)
        //3) create new DB in company name
        const companyDB=  await switchDB(adminData.companyName,'admins', adminSchema)
        //4) save same admin into the new company database - employee collections
        const EmployeeModel = await getDBModel(companyDB, 'employee',userSchema);
        const logsModel = await getDBModel(companyDB, 'logs',logSchema);
        const rulesModel = await getDBModel(companyDB, 'rules',ruleSchema);
        await EmployeeModel.create(adminData)
        const admin = await EmployeeModel.findOne({username : adminData.username} )

        // Convert the JavaScript object to a JSON string using JSON.stringify
        resolve ({status: true, id: admin._id});
    } catch (error) {
        console.error(error);
        reject(error);
    }
})
}

const getAllTenants = async () => {
    const tenantDB = await switchDB('MainDB', TenantSchemas)
    const tenantModel = await getDBModel(tenantDB, 'tenant')
    return tenants
}


const listAllEmployees = async () => {
        const customers = await getAllTenants()
        const mapCustomers = customers.map(async (tenant) => {
            const companyDB = await switchDB(tenant.companyName, CompanySchemas)
            const employeeModel = await getDBModel(companyDB, 'employee')
            return employeeModel.find({})
        })
        const results = await Promise.all(mapCustomers)
        return results
    }


module.exports  = {onSignupNewDatabase,listAllEmployees ,getAllTenants,switchDB,getDBModel}