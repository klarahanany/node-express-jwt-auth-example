const connectDB = require('./connectDB')
const TenantSchema= require ('./models/tenantSchema.js')
const EmployeeSchema= require ('./models/employeeSchema.js')
const userSchema = require('./models/userModel')
const catchAsync = require('./utils/catchAsync')
// Indicates which Schemas are used by whom
const CompanySchemas = new Map([['employee', userSchema]])
const TenantSchemas = new Map([['admins', userSchema]])


/** Switch db on same connection pool
 * @return new connection
 */
const switchDB = async (dbName, dbSchema) => {
    const mongoose = await connectDB()
    if (mongoose.connection.readyState === 1) {
        const conn =await mongoose.connection;
        const db = await conn.useDb(dbName, { useCache:true, noListener: true })
        let collections = db.collection('admins');
        collections.count().then((count) => {
            console.log(count);
        });

        // Prevent from schema re-registration
        if (collections.length === 0) {
            //create new collection
            dbSchema.forEach((schema, modelName) => {
                db.model(modelName, schema)
            })
        }
        return db
    }
    throw new Error('switchDB')
}


//getDBModel will allow us to get the registered model for our db.
/**
 * @return model from mongoose
 */
const getDBModel = async (db, modelName) => {
    return db.model(modelName, userSchema) // create/get new collection (modelName)  into company(db) with
}

const initTennants = async (tenantData) => {
    const tenantDB = await switchDB('MainDB', TenantSchemas);
    const tenantModel = await getDBModel(tenantDB, 'tenant');
    // await tenantModel.deleteMany({});
    await tenantModel.create(tenantData);//creating admin in mainDB(AppTenants)
    const UserDB=  await switchDB(tenantData.companyName, CompanySchemas)
    const EmployeeModel = await getDBModel(UserDB, 'employee');
    return EmployeeModel;
}

const onSignupNewDatabase = async (adminModel,adminData) =>{

    try{
        //1) swtichDB to AppTenant
        //  const tenantDB = await switchDB('MainDB', TenantSchemas);
        //2) create new admin user in AppTenant
        // const tenantModel = await getDBModel(tenantDB, 'admins');//point to tenant collection
        await adminModel.create(adminData);//creating admin in mainDB(AppTenants)
        //3) create new DB in company name
        const companyDB=  await switchDB(adminData.companyName, CompanySchemas)
        //4) save same admin into the new company database - employee collections
        const EmployeeModel = await getDBModel(companyDB, 'employee');
        EmployeeModel.create(adminData)
        return true;
    }catch (e) {
        console.log(e)
        return false;
    }

}


const onLogin_RedirectDatabase = async()=>{
    //1) switch DB to AppTenant


}
const getAllTenants = async () => {
    const tenantDB = await switchDB('MainDB', TenantSchemas)
    const tenantModel = await getDBModel(tenantDB, 'tenant')
    const tenants = await tenantModel.find({})
    return tenants
}

const initEmployees = async (name, email) => {
    const customers = await getAllTenants()
    const createEmployees = customers.map(async (tenant) => {
        const companyDB = await switchDB(tenant.companyName, CompanySchemas)
        const employeeModel = await getDBModel(companyDB, 'employee')
        await employeeModel.deleteMany({})
        return employeeModel.create({
            employeeId: Math.floor(Math.random() * 10000).toString(),
            name: name,
            email: email,
            companyName: tenant.companyName,
        })
    })
    const results = await Promise.all(createEmployees)
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


module.exports  = {onSignupNewDatabase,initTennants,initEmployees,listAllEmployees ,getAllTenants,switchDB,getDBModel}