const express = require('express');
const router = express.Router();

const fs = require('fs');

// Get Image from DB

router.get('/CategoryImages/:fileName', async(req,res) =>{

    const fileName = req.params.fileName;

    // console.log("DIRECTORY NAME :",__dirname);
    res.sendFile(__dirname +  '\\Images' + '\\' + 'Category' + '\\' + fileName);
});

router.get('/SubCategoryImages/:fileName', async(req,res) =>{

    const fileName = req.params.fileName;

    // console.log("DIRECTORY NAME :",__dirname);
    res.sendFile(__dirname +  '\\Images' + '\\' + 'SubCategory' + '\\' + fileName);
});

router.get('/CompanyImages/:fileName', async(req,res) =>{

    const fileName = req.params.fileName;

    // console.log("DIRECTORY NAME :",__dirname);
    res.sendFile(__dirname +  '\\Images' + '\\' + 'Company' + '\\' + fileName);
});


router.get('/Test/:fileName', async(req,res) =>{

    const fileName = req.params.fileName;

    console.log("DIRECTORY NAME :",__dirname);
    res.sendFile(__dirname +  '\\Test' + '\\' + fileName);
});

module.exports = router;