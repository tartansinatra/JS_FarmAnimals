var express        = require('express');
var path           = require('path');
var bodyParser     = require('body-parser');
var expressLayouts = require('express-ejs-layouts');
var app            = express();
var Animal = require('./models/animal');
var Farm   = require('./models/farm');
var farmRouter = express.Router();

//App settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Mongoose!
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/farm-manager');

//Let's get all the farms 
Farm.find(function(err, farms) {
  if(err) console.log(err)
  app.locals.farms = farms;
})


//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressLayouts);

//Serve js & css files from a public folder
app.use(express.static(__dirname + '/public'));

// ############ YOU CAN ADD YOUR ROUTES BELOW HERE
app.get("/", function(req, res){
  // INDEX
  Animal.find(function(err, animals) {
    if(err) console.log(err)
    res.render('index', { animals: animals });
  })
});

app.post("/", function(req, res){
  //CREATE
   var newAnimal = new Animal(req.body);
   newAnimal.vetReport = {health: req.body.health, outlook: req.body.outlook};

   newAnimal.save(function(err, animal){
     if(err) console.log(err);
     console.log("New animal created");

     //Add it to the selected farm
     Farm.findById(req.body.farm_id, function(err, farm){
        if(err) console.log(err);
        farm.addAnimal(animal);
        farm.save(function(err){
          if(err) console.log(err);
          res.redirect("/");
        })       
     })
   })
});

app.get("/:id", function(req, res){
  //SHOW

  Animal.findById(req.params.id, function(err, animal){
    if(err) console.log(err);
    res.render('show', { animal: animal })    
  })
});

app.get("/:id/edit", function(req, res){
  //EDIT
  Animal.findById(req.params.id, function(err, animal){
    if(err) console.log(err);
    res.render('edit', { animal: animal })    
  })
});


app.post('/:id', function(req, res){
  //UPDATE

  req.body.vetReport = { health:req.body.health, outlook:req.body.outlook };
  Animal.findByIdAndUpdate(req.body._id, req.body, function(err, animal){
    if(err) console.log(err);

    res.redirect("/");
  })
});

app.post('/:id/delete', function(req, res){
  //DELETE
  console.log(req.params.id);
  Animal.findByIdAndRemove(req.params.id, function(err) {
    if (err) console.log(err);

    console.log('Animal deleted!');
    res.redirect("/");
  });
});







app.listen(3000, function(){
  console.log("Welcome to the Farm Manager");
});