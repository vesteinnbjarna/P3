const port = 3000;
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
app.use(bodyParser.json())


events = [];


app.use('*',(req,res,next) => {
    console.log(req.method + " to " + req.originalUrl);
    next();
})



app.listen(port, () =>{
    console.log('Express app listening on port ' + port)
});

////////////////////////////////
//        THIS IS FOR         //
//      EVENT ENDPOINTS       //
////////////////////////////////

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

app.put('/api/v1/events/:eid', (req,res) => {
    fetchedEvent = doesEventExisits(req.params.eid);
    if (fetchedEvent != false){
        console.log("fetchedEvent:")
        console.log(fetchedEvent.bookings)

        updatedEvent = {
            "id":fetchedEvent.id,
            "name": req.body.name,
            "description": req.body.description,
            "location": req.body.location,
            "capacity": req.body.capacity,
            "startDate": req.body.startDate,
            "endDate": req.body.endDate,
            "bookings": fetchedEvent.bookings
        }  

        if(updatedEvent.bookings.length === 0){
            if (checkIfLegalEvent(updatedEvent) == true){
                for (let i=0;i<events.length;i++){
                    if(events[i].id == updatedEvent.id){
                        updatedEvent.startDate = new Date(updatedEvent.startDate * 1000);
                        updatedEvent.endDate = new Date(updatedEvent.endDate * 1000);
                        events[i] = updatedEvent;
                        res.status(200).json({"message":events[i]});
                        break;
                    }
                    
                }

            }
            
            else{
                res.status(400).json({"message":"Bad input"})
            }
        }
    
   
    }
    else{
        res.status(404)
    }


})


////////////////////////////////
//       THIS IS FOR          //
//     BOOKING ENDPOINTS      //
////////////////////////////////

//get all bookings for a single event
app.get('/api/v1/events/:eid/bookings/',(req, res)=>{
    
    if (events.length > 0){
        let bookings = getAllBookings(req.params.eid);
        console.log(bookings)
        console.log(bookings)

        if (bookings.length !== 0){
            res.status(200).json({bookings})
        }
        else
        {
            res.status(404).json({"message":"No bookings found!"});
        }
    }
    else{
        res.status(404).json({"message":"No events found!" });
    }
});

//create booking
app.post('/api/v1/events/:eid/bookings/',(req, res)=>{
   
    if (req.body === undefined || req.body.firstName === undefined || req.body.lastName == undefined || (req.body.tel === undefined && req.body.email === undefined ) || req.body.spots === undefined && req.body.spots >0 && isNaN(req.body.spots) == false ) {
        res.status(400).json({'message': "you left one of the required fields empty. You're allowed to leave either email or phone empty but not both"});
    }
    else {
        let SeatsOccupiedAtEvent= CalculateAmountOfUsedSeats(req.params.eid)
        fetchedEvent = doesEventExisits(req.params.eid)
        if (fetchedEvent != false)
        {
            nextid = idgeneratorforbookings(req.params.eid, fetchedEvent)
            let newBooking = {id: nextid, firstName: req.body.firstName, lastName: req.body.lastName, tel: req.body.tel, email: req.body.email, spots: req.body.spots}
            let TotalOccupiedSeats = SeatsOccupiedAtEvent + req.body.spots
            if (TotalOccupiedSeats <= fetchedEvent.capacity)
            {
                fetchedEvent.bookings.push(newBooking);
                res.status(201).json(newBooking);
            }
            else
            {
                res.status(400).json({"message":"Too many seats occupied"})
            }
        }
        else 
        {
            res.status(404).json({"message":"Event does not exists!"})
        }
    }
});


//get single booking for single event
app.get('/api/v1/events/:eid/bookings/:bid',(req,res) =>{
    fetchedEvent = doesEventExisits(req.params.eid)
    if (fetchedEvent != false)
    {
        var fetchedBookings = IdBookingFinder(req.params.bid, req.params.eid)
        if (fetchedBookings != false){
            res.status(200).json({"message":fetchedBookings})
        }
        else{
            res.status(404).json({"message":"Booking does not exists!"})
        }
    }

})

//delete a booking
app.delete('/api/v1/events/:eid/bookings/:bid', (req,res) => 
{
    fetchedEvent = doesEventExisits(req.params.eid)
    if (fetchedEvent != false)
    {
        var fetchedBookings = IdBookingFinder(req.params.bid, req.params.eid)
        if (fetchedBookings != false){
            res.status(200).json({"message":fetchedBookings})
            deleteSingleBooking(req.params.bid, req.params.eid)}
        else
        {
            res.status(404).json({"message":"Bookings not found!"})
        }
    }
    else
    {
        res.status(404).json({"message":"Event does not exists!"})
    }
 
})

//delete all bookings for a particular event
app.delete('/api/v1/events/:eid/bookings/', (req,res) => {
    fetchedEvent = doesEventExisits(req.params.eid)
    if (fetchedEvent != false)
    {
    var fetchedBookings = IdBookingFinder(req.params.bid, req.params.eid)
    if (fetchedBookings.length == 0){
        res.status(404).json({"message":"No bookings found!"});
    }
    else
    {
        deleteAllBookingsForEvent(req.params.eid)
        res.status(200).json({"message": "bookings deleted successfully"});
    }
    }
    else{
        res.status(404).json({"message":"Event does not exists!"})
    }
})

// IF failure to complete any of the above endpoints return failure
app.use('*',(req, res) => {
    res.status(405).send('Operation not supported.');
});

// HELPER FUNCTIONS BELOW

// checks if event is legal - needs some more work
function checkIfLegalEvent(newEvent){
    if (areDatesLegal(newEvent.startDate,newEvent.endDate)){
        console.log('dates OK')
        if (newEvent.name != "" && newEvent.capacity > 0){
            return true;
        } 
        else{
            console.log()
            return false;
        }


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
// Current date
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

function getAllBookings(idOfEvent){
    returned_array = []
    for (let i = 0; i<events.length; i++){
        if (events[i].id == idOfEvent) {
            return events[i].bookings
        }
    }
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





function idgeneratorforbookings(eventID, singleEvent){

    let myid = singleEvent.bookings.length;
    for (var i = 0; i < singleEvent.bookings.length; i++){
        if(singleEvent.bookings[i].id == myid) {
            myid += 1;
            myid = idgeneratorforbookings(myid)
            return myid;
        }
    }
    return myid;
}

function IdBookingFinder(bookingid,eventID){
    bookings = getAllBookings(eventID)
    for (var i = 0; i < bookings.length; i++){
        if(bookings[i].id == bookingid){
            return bookings[i];
        }
    }
    return false;
}

// Deletes a single booking
function deleteSingleBooking(BookingID, eventID){
    bookings = getAllBookings(eventID)
    for (let i = 0; i<bookings.length;i++){
        if (bookings[i].id == BookingID){
            bookings.splice(i,1);
        }
    }
}

// Deletes all bookings for an event
function deleteAllBookingsForEvent(eventID){
    let myarr = []
    for(let i=0; i<events.length;i++){
        if (events[i].id == eventID)
        {
            events[i].bookings = myarr
        }
    }
    return 
}

function CalculateAmountOfUsedSeats(eventID){
    let theBookings = []
    let count = 0
    for(let i=0; i<events.length;i++){
        if (events[i].id == eventID)
        {
            theBookings = events[i].bookings
        }
    for(let i=0; i<theBookings.length;i++){
            count += theBookings[i].spots
        }
    }
    return count
}