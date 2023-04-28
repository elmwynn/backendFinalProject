const express = require('express');
//const { get } = require('http');
const router = express.Router();
const path = require('path');
const statesController = require('../../controllers/statesController');
//const { STATES } = require('mongoose');



router.route('/')
    .get(statesController.getAllStates)

router.route('/:state')
    .get(statesController.getState);
    
router.route('/:state/:parameter')
    .get(statesController.getStateData)
    .post(statesController.createNewFunFact)
    .patch(statesController.changeFunFact)
    .delete(statesController.deleteFunFact);

router.all('*', (req, res)=> {
    res.status(404);
    if(req.accepts('html'))
        res.sendFile(path.join(__dirname, '..', '..', 'views', '404.html'));
    else if(req.accepts('json'))
        res.json({"error" : "404 Not Found"})
    });


       

module.exports = router;