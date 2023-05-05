const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js")
const { Schema } = mongoose;
 
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', {useNewUrlParser : true});
 
const itemsSchema = new Schema({
  _id : Number,
  name:  String
});
 
const Item = mongoose.model('Item', itemsSchema);
const item1 = new Item({
  _id : 1,
  name:"Welcome to your ToDo List!"});
const item2 = new Item({
  _id : 2,
  name:"Hit the + button to add new item."});
const item3 = new Item({
  _id :3,
  name:"<-- Hit this to delete an item."});
 

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items:[itemsSchema]
}
 
const List = mongoose.model("List", listSchema);
 
 
const workItems = [];
 
app.get("/", function(req, res) {

  const day = date.getDate();
  Item.find({}, function(err,foundItems){

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if(err){
         console.log(err);
        } else {
         console.log("Successfully saved default items to database.");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
   
  });

 
});

app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName;
 
  
List.findOne({name: customListName}, async function(err, foundList) {
    if (err) {
      console.log(err);
    } else {
      //existing list
      if (foundList) {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      } else {
        // create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      };
    };
  });
});

var key = 4;
app.post("/", function(req, res){
 
  const itemName = req.body.newItem;
 
  const item = new Item({
    _id : key,
    name: itemName
  });
 
  item.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
  key++;
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId,function(err){
    if(!err){
      console.log("Successfully deleted checked item");
      res.redirect("/");
    }
  });

});


 
app.get("/about", function(req, res){
  res.render("about");
});
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});