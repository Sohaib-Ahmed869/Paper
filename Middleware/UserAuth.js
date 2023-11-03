const UserModel = require("../Models/user");
const jwt = require("jsonwebtoken");

const UserAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        console.log(token);
        const decoded = jwt.verify(token, "secret");
        console.log(decoded);
        const user = await UserModel.findOne({ _id: decoded.id, name: decoded.name});
        if(decoded.name != req.body.name){
            console.log("Invalid User");
            throw new Error();
        }
        console.log(user);
        if (!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({ error: "Not authorized to access this resource" });
    }
};

module.exports = UserAuth;