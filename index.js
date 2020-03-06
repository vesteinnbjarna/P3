// END POINTS
// EVENTS

// READ ALL EVENTS :  /api/v1/events GET
// READ AN INDIVIDUAL EVENT: /api/v1/events/:id/ GET
// CREATE AN EVENT: /api/v1/events POST
// UPDATE EVENT; /api/v1/events UPDATE
// DELETE INDIVIDUAL EVENT: /api/v1/events/:id DELETE
// DELETE ALL EVENTS /api/v1/events DELETE

//BOOKINGS
// READ ALL BOOKINGS FOR AN EVENT:  /api/v1/events/:id/bookings : GET
// READ INDIVIUDAL BOOKING FOR AN EVENT: /api/v1/events/:id/bookings/:id : GET
// CREATE A NEW EVENT: /api/v1/events/:id/bookings/ : POST
// DELETE AN BOOKING: /api/v1/events/:id/bookings/:id : DELETE
// DELETE ALL BOOKINGS FOR A PARTICULAR EVENT: /api/v1/events/:id/bookings/ : DELETE


const port = 3000;
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
app.use(bodyParser.json())



// const event = {
//     "id": 0,
//     "name": "",
//     "description": "",
//     "location": "",
//     "capcity": 0,
//     "startDate" : "",
//     "endDate": "",
//     "bookings": []
// }

// const booking = {
//     "id": 0,
//     "firstName": "",
//     "lastName": "",
//     "spots": 0,
//     "email": "",
//     "tel": ""
// }


events = [];


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
    "startDate":req.body.startDate,
    "endDate":req.body.endDate,
    "bookings":[]}


    if (checkIfLegalEvent(newEvent)){
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
        res.status(404).json({message:"Event does not exists!"})
    }

})

// delete all events
app.delete('/api/v1/events', (req,res) => {
    if (events.length == 0){
        res.status(404).json({message:"No events found!"});
    }
    else {
        returnedArray = deleteAllEvents(events);
        res.status(200).json({"message": returnedArray});
    }

})

app.delete('/api/v1/events/:eid', (req,res) => {
   
   var fetchedEvent = doesEventExisits(req.params.eid)
   if (fetchedEvent != false){
       console.log(fetchedEvent)
       res.status(200).json({"message":fetchedEvent})
       deleteSingleEvent(req.params.eid)

   }

   else{
       res.status(404).json({"message":"Event not found!"})
   }
   

})


// checks if event is legal - needs some more work
function checkIfLegalEvent(newEvent){
    if (newEvent.name != ""  && newEvent.capacity >0 && newEvent.endDate != "" && newEvent.startDate != ""){
        return true;
    }
    else{
        return false;
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