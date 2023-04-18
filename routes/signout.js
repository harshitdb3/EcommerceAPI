const express = require('express');
const router = express.Router();

router.post('/',(req,res)=>
{

    req.session.destroy();

    res.send('Sign out success');
});

module.exports = router;
