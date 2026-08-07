const express = require("express");
const router = express.Router();

const { sendEmail } = require("../utils/email");

router.get("/email", async (req,res)=>{

    try{

        await sendEmail({
            to: process.env.EMAIL_USER,
            subject:"Luxe Events Test",
            html:"<h1>Email Working Successfully 🎉</h1>"
        });

        res.json({
            success:true
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            success:false,
            error:err.message
        });

    }

});

module.exports = router;