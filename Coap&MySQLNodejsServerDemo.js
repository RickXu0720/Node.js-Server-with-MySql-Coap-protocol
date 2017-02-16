var coap    = require('coap');
var mysql = require("mysql");
var con = mysql.createConnection({
  host: "localhost",
  user: root,
  password: "",

  database: "test"
});

var self=this;
 con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }

  console.log('Connection established');
  });

var server  = coap.createServer();
var fs = require('fs');
var jsonstr;
server.on('request', function(req, res) {
   console.log(req.headers);
    if (req.headers['Accept'] != 'application/json') {
        res.code = '4.06';
        return res.end();
    }


      if(req.headers['Observe'] == 0){
         var interval = setInterval(function() {

         var records = [];
         var json="";
 
       var temp = Math.floor(Math.random()*100+1);
       var light = Math.floor(Math.random()*100+1);
       var humidity = Math.floor(Math.random()*100+1);

       
      var tempL = tempLevel(temp);
      var lightL = lightLevel(light);
     var humidityL = humidityLevel(humidity);
     


   
       var item =  { "time":new Date().toISOString(),
           "temp":temp,
           "light":light,
           "humidity":humidity,
           "templevel":tempL,
           "lightlevel":lightL,
           "humiditylevel":humidityL
                      };
    
       records.push(item);
   

       json = JSON.stringify(item);
     res.setOption('Content-Format', 'application/json');     
     res.write(json);
     }, 1000)
      }
      else
      {
      
      var cate = req.url.split('/')[1];
      var str = req.url.split('/')[2];
      var value = str.split('=')[1];
      console.log(value); 
      console.log(cate);
       if(cate == 'plant')
      {
       var filePath="/Users/xurenke/Downloads/fit5140Assign2-RenkeXu/temp"+value+".txt" 
       fs.readFile(filePath, "utf8", function (error, data) {
       var lines = data.split("\n");
       var rec = new Array();
       var sumTemp=0;
       var sumLigher=0;
       var sumHumidity=0;


       for(var l = 0; l < lines.length-1; l++){
       var row = lines[l].split(" ");
       rec[l]=new Array();
       for(var i = 0; i < row.length;i++)
       {

            rec[l][i]=row[i];
         }
       sumTemp += parseInt(rec[l][1]);
       sumLigher += parseInt(rec[l][2]);
       sumHumidity += parseInt(rec[l][3]);
       }
      var aveTemp = parseInt(sumTemp/lines.length);
      var aveLigher = parseInt(sumLigher/lines.length);
      var aveHumidity = parseInt(sumHumidity/lines.length);
      console.log("----");
      console.log(aveHumidity);
      var tempL = tempLevel(aveTemp);
      var lightL = lightLevel(aveLigher);
     var humidityL = humidityLevel(aveHumidity); 
      console.log("s"+tempL+" "+humidityL+" "+lightL);   
   
      var f;
      var select = "select * from flowers where temp='"+tempL+"' and lighter = '"+lightL+"' and humidity ='"+humidityL+"'";// and lighter ="+lightL+"";// and humidity = "+humidityL+"";
      con.query(select,function(err,results){
     if(err) throw err;
       console.log(results[0].flowers_name);
        
       var item =  { "avetemp":aveTemp,
            "templevel": tempL,
            "avelight":aveLigher,
            "lgihtlevel":lightL,
            "aveHumidity":aveHumidity,
            "humiditylevel":humidityL,
             "flower": results[0].flowers_name,
            "desc":results[0].description
                     };

     json = JSON.stringify(item);

          res.setOption('Content-Format', 'application/json');
          res.end(json);
   });
   
    
      var records=[];
      var json="";
      
  
    
        });
       }
     else if(cate =='place')
     {
         var d='dddddd';
       var f = findFlower(value,function(err,data)
         {
             if(err){console.log("Err",err)}
             else{console.log("dsdsds:",data[0].flowers_name)
                   
              var item =  {
             
             "flower": data[0].flowers_name,
              "lighter":data[0].lighter,
             "temp":data[0].temp,
             "humidity":data[0].humidity,
                 "desc":data[0].description,
              "sensor":"1"
                     };
     
  
      json = JSON.stringify(item);
    
          res.setOption('Content-Format', 'application/json');
          res.end(json); 
              
               }
         } 
         );
          console.log(f);

 
     }
     else if(cate == 'add')
    {
         var str2 = req.url.split('/')[3];
         var plant = str2.split('=')[1];
        console.log(value);
        console.log(plant);
         var flower_sensor = { ID: value, flower: plant };
        con.query('INSERT INTO sensor_record SET ?', flower_sensor, function(err,res1){
         if(err) throw err;
        
       var item =  {

             "success": "successful",
                     };


      json = JSON.stringify(item);

          res.setOption('Content-Format', 'application/json');
          res.end(json);
          console.log('Last insert ID:', res1);
        });
     }
      }

     
  
  
})
server.listen(function() {
  console.log('server started')
})

function tempLevel(value)
{
   var level="";
   if(value<30)
   {
     level = "low";
   }
   else if(29<value && value<100)
   {
     level = "medium";
   }
   else if(value>99)
   {
     level = "high";
   }
  return level;
}
function lightLevel(value)
{
   var level="";
   if(value<30)
   {
     level = "low";
   }
   else if(29<value && value<50)
   {
     level = "medium";
   }
   else if(value>49)
   {
     level = "high";
   }
  return level;
}
function humidityLevel(value)
{
   console.log("humi--");
   console.log(value);
   var level="";
   if(value<30)
   {
     level = "low";
   }
   else if(29<value && value<50)
   {
     level = "medium";
   }
   else if(value>50)
   {
     level = "high";
   }
  return level;
}

function Flower(temp,callback)
{
    
    var rows;
     con.query('SELECT flowers_name FROM flowers',function(err,results){
     if(err) throw err;
      //console.log('Data received from Db:\n');
     else{ var f = results[0].flowers_name;
      console.log(f);
      console.log(results[0].flowers_name);
      callbacl(null,results);
    }
   });
}
function findFlower(flowerName,callback)
{

    var r='22';  
    con.query('SELECT * FROM flowers where flowers_name = ?',flowerName,function(err,results){
     if(err){ callback(err,null);}
     else{callback(null,results);}
     console.log("---");
//      console.log(results);
   });

    return r;
}
