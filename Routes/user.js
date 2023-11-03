const mongoose = require('mongoose');
const jsonwebtoken = require('jsonwebtoken');
const Router = require('express').Router;
const User = require('../Models/user');
const bcrypt = require('bcrypt');
const { json } = require('express');
const jwt = require('jsonwebtoken');
const UserAuth = require('../Middleware/UserAuth');
const fileUpload = require('express-fileupload');
const path = require('path');
const util = require('util');


const router = new Router();

router.use(fileUpload());



const Secret = "secret";

router.post('/register', async (req, res) => {
    try {
        console.log(req.body);
        const name = req.body.name;
        const email = req.body.email;
        const password = await bcrypt.hash(req.body.password, 10);
        const user = new User({ name, email, password });
        await user.save();
        res.json(user);
    }
    catch (err) {
        console.log('Error in registration');
        res.json(err);

    }
});

router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await User.findOne({ name });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        //generate token
        const token = jwt.sign({ id: user._id , name: user.name}, Secret);
       

        user.token = token;
        await user.save();

        res.json({ token });


    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: 'Invalid credentials' });
    }

}); 

router.put('/update-password', UserAuth, async (req, res) => {
    try {
        const { name, password } = req.body;

        const user = await User.findOne({ name });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Update the password
        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.json('Password updated successfully');
    } catch (err) {
        console.error('Error in updating password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post ('/logout', UserAuth, async (req, res) => {
    try {
        const user = req.user;
        user.token = '';
        await user.save();

        res.json('Logged out successfully');
    } catch (err) {
        console.error('Error in logging out:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post ('/upload-picture', UserAuth, async (req, res) => {
    const file = req.files.file;
    const fileName = file.name;
    const extension = path.extname(fileName);
    const caption = req.body.caption;
    const allowedExtensions = /png|jpeg|jpg/;
    if (!allowedExtensions.test(extension)) {
        return res.status(400).send('Invalid extension.');
    }
    const md5 = file.md5;
    await util.promisify(file.mv)('./uploads/' + md5 + extension);


    //save to database
    const user = req.user;
    user.picture = { md5, extension, caption };
    await user.save();
    res.json('Picture uploaded successfully');

});



module.exports = router;