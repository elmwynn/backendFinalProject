const path = require('path');
const State = require('../models/State');
const data = {
    states: require('../models/statesData.json'),
    setStates: function (data) {
        this.states = data;
    }
};

const getAllStates = async (req,res) =>{
    let states = data.states;
    if(req.query.contig === 'true'){
        states = states.filter(state => state.code !== 'AK' && state.code !== 'HI');
    }
    else if(req.query.contig === 'false'){
        states = states.filter(state => state.code === 'AK' || state.code === 'HI');
    }
        res.json(states);
}


const getState = async (req,res) => {
    const dataHolder = data.states.find(st => st.code === ((req.params.state).toUpperCase()));
    const state = data.states.find(st => st.code === ((req.params.state).toUpperCase()));
    if(state){
        const result = await State.find({ stateCode: dataHolder.code}).exec();
        if(result.length !== 0){
            const factArray = {
                "funfacts": result[0].funfacts
            }
            const combined = {...state, ...factArray};
            res.json(combined);
        }
        else
            res.json(state);
    }
    else{
        res.status(404);
        if(req.accepts('html'))
            res.sendFile(path.join(__dirname, '..', 'views', '404.html'));
        else if(req.accepts('json'))
            res.json({"message" : "Invalid state parameter"})
    }
}



const getStateData = async (req,res) => {
    const dataHolder = data.states.find(st => st.code === ((req.params.state).toUpperCase()));
    if(req.params.parameter === 'capital'){
        const array = {
            "state": dataHolder.state,
            "capital": dataHolder.capital_city
        }
        res.json(array);
    }
    else if(req.params.parameter === 'nickname'){
        const array = {
            "state": dataHolder.state,
            "nickname": dataHolder.nickname
        }
        res.json(array);
    }
    else if(req.params.parameter === 'population'){
        const array = {
            "state": dataHolder.state,
            "population": dataHolder.population.toLocaleString('en-US')
        }
        res.json(array);
    }
    else if(req.params.parameter === 'admission'){
        const array = {
            "state": dataHolder.state,
            "admitted": dataHolder.admission_date
        }
        res.json(array);
    }
    else if(req.params.parameter === 'funfact'){
        const result = await State.find({ stateCode: dataHolder.code}).exec();
        if(result.length === 0){
            res.json({"message": `No Fun Facts found for ${dataHolder.state}`});
        }
        else{
            const funfact = result[0].funfacts
            const chosenFact = funfact[(Math.floor(Math.random() * funfact.length))];
            const factArray ={
                "funfact": chosenFact
            }
            res.json(factArray);
        }
    }
    else{
        res.status(404);
        if(req.accepts('html'))
            res.sendFile(path.join(__dirname, '..', 'views', '404.html'));
        else if(req.accepts('json'))
            res.json({"message" : "Invalid state abbreviation parameter"})
    }
    
}

const createNewFunFact = async (req,res) =>{
    if(req.params.parameter === 'funfact'){
        try{
            const alreadyExists = await State.find({ stateCode: (req.params.state).toUpperCase()}).exec();
            if(alreadyExists.length === 0){
                //if the document does not yet exist, create a new one
                //by creating new code and funfact array
                const result = await State.create({
                    stateCode: req.params.state,
                    funfacts: req.body.funfacts
                });
                res.status(201).json(result);
            }
            else{
                //if it does exist already
                //just add to the array without adding the stateCode
                const filter = {stateCode: (req.params.state).toUpperCase()};
                const update = {$push: {funfacts: req.body.funfacts}};
                await State.findOneAndUpdate(
                    filter, 
                    update
                );
                const result = await State.find({ stateCode: (req.params.state).toUpperCase()}).exec();
                res.status(201).json(result);
            }
        } catch (err){
            console.error(err);
        }
    } 
    else{
        res.status(404);
        if(req.accepts('html'))
            res.sendFile(path.join(__dirname, '..', 'views', '404.html'));
        else if(req.accepts('json'))
            res.json({"error" : "404 Not Found"})
    }
}

const deleteFunFact = async(req,res) =>{
    if(req.params.parameter === 'funfact'){
        try{
            const upperState = req.params.state.toUpperCase()
            const dataHolder = data.states.find(st => st.code === upperState);
            const stateCheck = await State.find({ stateCode: upperState}).exec();
            if(!req?.body?.index || req.body.index === 0){
                //check to see if the index has been provided
                res.status(400).json({"message": "State fun fact index value required"});
            }
            else if(stateCheck.length === 0){
                //check to see if there are any funfacts in the array
                res.status(400).json({"message": `No Fun Facts found for ${dataHolder.state}`});   
            }
            else if(stateCheck[0].funfacts.length < req.body.index){
                res.status(400).json({"message": `No Fun Facts found at that index for ${dataHolder.state}`}); 
            }
            else{
                const oneToDelete = stateCheck[0].funfacts[req.body.index-1];
                await State.findOneAndUpdate(
                    {stateCode: upperState},
                    {$pull: {funfacts: oneToDelete}},
            
                );
                const afterUpdate = await State.find({ stateCode: upperState}).exec();
                res.json(afterUpdate);
            }    
        } catch (err){
            console.error(err);
        }
    } 
    else {
        res.status(404);
        if(req.accepts('html'))
            res.sendFile(path.join(__dirname, '..', 'views', '404.html'));
        else if(req.accepts('json'))
            res.json({"error" : "404 Not Found"})
    }
}

const changeFunFact = async(req, res) =>{
    if(req.params.parameter === 'funfact'){
        try{
            const upperState = req.params.state.toUpperCase()
            const dataHolder = data.states.find(st => st.code === upperState);
            const stateCheck = await State.find({ stateCode: upperState}).exec();
            if(!req?.body?.index || req.body.index === 0){
                //check to see if the index has been provided
                res.status(400).json({"message": "State fun fact index value required"});
            }
            else if(!req?.body?.funfact){
                res.status(400).json({"message": "State fun fact value required"});
            }
            else if(stateCheck.length === 0){
                //check to see if there are any funfacts in the array
                res.status(400).json({"message": `No Fun Facts found for ${dataHolder.state}`});   
            }
            else if(stateCheck[0].funfacts.length < req.body.index){
                res.json({"message": `No Fun Facts found at that index for ${dataHolder.state}`}); 
            }
            else{
                
                await State.findOneAndUpdate(
                    {stateCode: upperState},
                    {$set: {[`funfacts.${[req.body.index-1]}`]: req.body.funfact}}
                );
                const afterUpdate = await State.find({ stateCode: upperState}).exec();
                res.json(afterUpdate);
            }
               
        } catch (err){
            console.error(err);
        }
    } 
    else {
        res.status(404);
        if(req.accepts('html'))
            res.sendFile(path.join(__dirname, '..', 'views', '404.html'));
        else if(req.accepts('json'))
            res.json({"error" : "404 Not Found"})
    }
}


module.exports = {
    getAllStates,
    getState,
    getStateData,
    createNewFunFact,
    deleteFunFact,
    changeFunFact
}