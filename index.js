


const port = 3000;
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
app.use(bodyParser.json())


events = [];

app.use('*',(req, res) => {
    res.status(405).send('Operation not supported.');
});

app.use('*',(req,res,next) => {
    console.log(req.method + " to " + req.originalUrl);
    next();
})



app.listen(port, () =>{
    console.log('Express app listening on port ' + port)
});

// Get all events!
app.get('/api/v1/events', (req,res) =>{
    if (events.length > 0){
        res.status(200).json({message: getAllEvents()})
    }
    else{
        res.status(404).json({"message":"No events found!" });
    }
})

// create event
app.post('/api/v1/events/', (req,res) =>{
    let newEvent = {"id": getNextId(), 
    "name":req.body.name, 
    "description":req.body.description,
    "location":req.body.location,
    "capacity":req.body.capacity,
    "startDate":req.body.startDate, // sent in unix timestamp format
    "endDate":req.body.endDate, // sent in unix timestamp format
    "bookings":[]}
    console.log(newEvent)


    if (checkIfLegalEvent(newEvent)){
        var updatedStartDate = new Date(newEvent.startDate*1000);
        var updatedEndDate = new Date(newEvent.endDate * 1000);
        newEvent.startDate = updatedStartDate;
        newEvent.endDate = updatedEndDate;
        res.status(201).json({"message":newEvent})
        events.push(newEvent);
    }
    else{
        res.status(400).json({"message":"Bad input"})
    }


});



//get single event
app.get('/api/v1/events/:id',(req,res) =>{
    var fetchedEvent = doesEventExisits(req.params.id)
    if (fetchedEvent != false){
        res.status(200).json({"message":fetchedEvent})
    }
    else{
        res.status(404).json({"message":"Event does not exists!"})
    }

})

// delete all events
app.delete('/api/v1/events', (req,res) => {
    if (events.length == 0){
        res.status(404).json({"message":"No events found!"});
    }
    else {
        returnedArray = deleteAllEvents(events);
        res.status(200).json({"message": returnedArray});
    }

})

app.delete('/api/v1/events/:eid', (req,res) => {
   
   var fetchedEvent = doesEventExisits(req.params.eid)
   if (fetchedEvent != false){
       res.status(200).json({"message":fetchedEvent})
       deleteSingleEvent(req.params.eid)

   }

   else{
       res.status(404).json({"message":"Event not found!"})
   }
   

})

// app.put('/api/v1/events/:eid', (req,res) =>{
//     var fetchedEvent = doesEventExisits(req.params.eid)
//     if (fetchedEvent != false){
//        req_event = {
//            "name":req.body.name,
//            "description":req.body.description,
//            "location":req.body.location,
//            "capacity":req.body.capacity,
//            "startDate":req.body.startDate,
//            "endDate":req.body.endDate

//        }

//        if (checkIfLegalEvent(req_event)){
//             //update the event
//             updatedEvent = []
//             res.status(200).json({"message": updatedEvent})
//        }

//        else{
//            res.status(400).json({"message":"Invalid input!"})
//        }
         

//     }
//     else{
//         res.status(404).json({"message":"Event does not exist!"})
//     }
// })




// HELPER FUNCTIONS BELOW

// checks if event is legal - needs some more work
function checkIfLegalEvent(newEvent){
    if (areDatesLegal(newEvent.startDate,newEvent.endDate)){
        console.log('dates OK')
        return true


    }

    else{
        console.log('bad dates')
        return false
    }

}



function areDatesLegal(startDate,endDate){
    // most likely a more elegent way to do this
    
    
    start = Number(startDate)
    end = Number(endDate)
    // The input must be of unix timestamp format so if we get a NaN it's not on the correct format

    if (isNaN(start) || isNaN(end)){
        console.log('NaN')
        return false;
    }

    var start = new Date(startDate*1000);
    var end = new Date(endDate*1000);
    var curr = new Date(Date.now());
    


// Start date can't be higher then end date
    if (start >= end){
        console.log("start>=end");
        return false;
    }
// Current 
    if (start < curr){
        console.log("curr > start");
        return false;
    }

    else{
        return true;
    }


}


// gets all events 
// returns an array
function getAllEvents(){
    returned_array = []
    for (let i = 0; i<events.length; i++){
        object = {"name":events[i].name,
            "id":events[i].id,
            "capacity":events[i].capacity,
            "startDate":events[i].startDate,
            "endDate":events[i].endDate
        }
        returned_array.push([object])
        
    }
    return returned_array
}


// Generates nextID
function getNextId(){
    if (events.length > 0){        
        for (let i = 0; i<events.length;i++){
            if (i != events[i].id){
            return i
        }

        return events.length

        
    }
        }
    return 0;
    
}

// Deletes a single event 
function deleteSingleEvent(eventID){
    for (let i = 0; i<events.length;i++){
        if (events[i].id == eventID){
            events.splice(i,1);
        }
    }
}



// Checks if an event exists if it does it returns it
function doesEventExisits(eventID){
    for(let i=0; i<events.length;i++){
        if (events[i].id == eventID){
            return events[i];
        }

    }
    return false

}



function deleteAllEvents(events) {
    var retArr = []
    for (let i = 0; i<events.length;i++){
        retArr.push(events[i])
    }
    events.length = 0;
    return retArr;    
}
