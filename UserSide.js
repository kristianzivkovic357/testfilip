var express=require('express');
var session=require('client-sessions');
var bodyParser = require('body-parser');
var app=express();
var mongo=require('./mongo');
var async=require('async')
var ObjectId = require('mongodb').ObjectId;
var exec=require('child_process').exec;
//var sender=require('./sender.js');
//var sql=require('./sql.js');
/*
var child = exec('node ./senderb.js');
child.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
});
child.stderr.on('data', function(data) {
    console.log('stderr: ' + data);
});
child.on('close', function(code) {
    console.log('closing code: ' + code);
});*/
app.use(session({
  cookieName: 'session',
  secret: 'Vojvoda*?od?!Vince357',
  duration: 10000 * 60 * 1000,
  activeDuration: 10000 * 60 * 1000,
}));
function generateHash(numberOfChars)
{
  var text='';
  var possible="abcdefghijklmnopqrstuvwxyz0123456789"
  for(var i=0;i<numberOfChars;i++)
  {
      min = 0
      max = possible.length-1;
      text+=possible[Math.floor(Math.random() * (max - min + 1)) + min]; //The maximum is inclusive and the minimum is inclusive 
  }
    return text;
}
function swap(items, firstIndex, secondIndex){
  var temp = items[firstIndex];
  items[firstIndex] = items[secondIndex];
  items[secondIndex] = temp;
}
function validateEmail(email) {
  var re =/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
function partition(items, left, right,sta) {

  var pivot   = items[Math.floor((right + left) / 2)],
  i       = left,
  j       = right;


  while (i <= j) {


    switch(sta) {
      case 'jeft':
      while (Number(items[i].cena) < Number(pivot.cena)) i++;
      while (Number(items[j].cena) > Number(pivot.cena)) j--;
      break;
      case 'skup':
      while (Number(items[i].cena) > Number(pivot.cena)) i++;
      while (Number(items[j].cena) < Number(pivot.cena)) j--;
      break;
      case 'manje':
      while (Number(items[i].kvadratura) < Number(pivot.kvadratura)) i++;
      while (Number(items[j].kvadratura) > Number(pivot.kvadratura)) j--;
      break;
      case 'vece':
      while (Number(items[i].kvadratura) > Number(pivot.kvadratura)) i++;
      while (Number(items[j].kvadratura) < Number(pivot.kvadratura)) j--;
      break;
    }

    if (i <= j) {
      swap(items, i, j);
      i++;
      j--;
    }
  }

  return i;
}
function quickSort(sta,items, left, right) {

  var index;

  if (items.length > 1) {

    left = typeof left != "number" ? 0 : left;
    right = typeof right != "number" ? items.length - 1 : right;

    index = partition(items, left, right,sta);

    if (left < index - 1) {
      quickSort(sta,items, left, index - 1);
    }

    if (index < right) {
      quickSort(sta,items, index, right);
    }

  }

  return items;
}



app.use(function(req, res, next)
{/*
  if (req.url=='/') {
    if(req.session.user)
    {
      res.writeHead(302,{'Location':'home'})
      next();
    }
  }*/
  if((req.url!='/')&&(req.url!='/login')&&(req.url!='images/no-image.jpg')&&(req.url!='/register')&&(req.url!='/css')&&(req.url!='/endpoint')&&(req.url!='/landing')&&(req.url.indexOf('/home'))&&(req.url!='/radio'))
  {
    console.log('u middle');
    console.log(req.session.user)
    if(req.session.user)
    {
      next();
    }
    else
    {
      console.log('Nema sesiju')
      if(req.headers.aplikacija) {
        res.end('NO_SESSION');
      } else {
        res.writeHead(302,{'Location':'/'})
      }
    }

  }
  else next();
});
var db;
mongo.MongoWrapper(function(d)
{
  db=d;//UZIMANJE KONEKCIJE SAMO JEDANPUT;
})

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
app.use(bodyParser());
app.get('/register',function(req,res)
{
  res.sendFile('views/register.html',{root:__dirname});
})
app.get("/login",function(req,res)
{
  res.sendFile('views/login.html',{root:__dirname});
})
app.get('/',function(req,res)
{
  res.sendFile('views/index.html',{root:__dirname});
})
app.get("images/no-image.jpg",function(req,res)
{
  res.sendFile('no-image.jpg',{root:__dirname});
})
app.get("/landing",function(req,res)
{
  res.sendFile('/images/landing.jpg',{root:__dirname});
})
app.get("/radio",function(req,res)
{
  res.sendFile('ikon.png',{root:__dirname});
})
app.get("/load",function(req,res)
{
  res.sendFile('giphy.gif',{root:__dirname});
})
app.get("/",function(req,res)
{
  res.end('Under construction');
})
app.get("/json",function(req,res)
{
  var opstine=db.collection('opstine');
  opstine.find({},{naziv:true}).toArray(function(err,r)
  {
   var a = [];
   for(var i = 0;i<r.length;i++) a.push(r[i].naziv);
    res.end(JSON.stringify(a));
})


})
app.post('/registrationId',function(req,res)
{

    if(req.session.user)
    {
      console.log('REGISTRATION  ID');
      console.log(req.body);
      console.log(req.session.user);
        var users=db.collection('users');
        users.update({"email":req.session.user.email},{$set:{"userId":req.body.registrationId}},function(err,response)
        {
            if(err)
            {
              console.log(err);
            }
            res.send(200);
            res.end();

        })
    }
    else
    {
      res.send('Not logged in');
      res.end();
      console.log('not logged in');
    }
})
app.get('/confirmation/:code',function(req,res)
{
    var code=req.params.code;
    var users=db.collection('users');
    users.findOne({code:code},{id:1,email:1},function(err,res)
    {
        if(res.length)
        {

          users.update({email:res.email},{$set:{accountConfirmed:1,code:undefined}},function(err,resp)
          {
              if(!err)
              {
                res.send('You have successfully activated your account');
              }
              else
              {
                res.send('Error 404');
              }
          })
          
        }
        else
        {
          res.send('Error 404');
        }
    })
})
app.post('/register',function(req,res)
{
  console.log('REGISTER');
  if((req.body.password==req.body.pass2)&&(req.body.password)&& req.body.email)
  {
   var users=db.collection('users');

      users.find({"email":req.body.email,"password":req.body.password},{}).toArray(function(err,re)
      {
        users.find().sort({userId:1}).limit(1).toArray(function(err,maxUserId)
        {
          console.log(maxUserId);
          if(re.length)
          {
            console.log('IMA TAKVOG USERA');
            if(req.headers.aplikacija) 
              {
              console.log('aplikacija')
              res.send('-1');
            }
            else 
            {
                res.writeHead(302,{'Location':'/register'})
            }
            res.end();
          }
          else
          {
            if(validateEmail(req.body.email))
            {
              //send email here
              console.log('Nema usera');
              var obj={};obj.email=req.body.email;obj.password=req.body.password;
              //generating confirmation hash
              obj.code=generateHash(75);
              if(maxUserId.length)obj.id=maxUserId[0].userId;
              else obj.id=1;
              req.session.user = obj;
              console.log(obj)
              users.insert(obj,function(err,r)
              {
                if(!err)
                {
                console.log('create user:'+req.body.email);
                if(req.headers.aplikacija) {
                  console.log('aplikacija')
                  res.send('1');
                } else {
                  res.writeHead(302,{'Location':'/home'})
                }
                res.end();
              }
              else console.log(err);
            });
          }
          else
          {
            res.send("0");
            res.end();
          }
        }
        })
      })

    }
    else
    {
      console.log('NE VALJA ')
      if(req.headers.aplikacija) {
        console.log('aplikacija')
        res.send('-2')
      } else {
        res.writeHead(302,{'Location':'/register'})
      }
      res.end();
    }

  })

app.post("/login",function(req,res)
{
	if((req.body.email)&&(req.body.password))
	{
    console.log('USO')
    var users=db.collection('users');
    users.findOne({"email":req.body.email,"password":req.body.password},{},function(err,r)
    {
      if(err)console.log(err)
       else
       {
        console.log(r);
        if(r)
        {
          req.session.user =Object.assign({},r);
          console.log(req.session.user)
          console.log('send OK')
          if(req.headers.aplikacija) {
            console.log('aplikacija')
            res.send('1')
          } else {
            res.writeHead(302,{'Location':'/home'})
          }
          res.end();
        }
        else
        {
          if(req.headers.aplikacija)
          {
            console.log('aplikacija')
            res.send('0')
          }
          else
          {
            res.writeHead(302,{'Location':'/login'})
          }
          res.end();
        }
      }
    })

  }
})
app.get('/home',function(req,res)
{
  console.log('home');
  console.log(req.session.user);
  res.sendFile('views/oglasi.html',{root:__dirname});
})
app.get('/stari',function(req,res)
{
  console.log('home');
  console.log(req.session.user);
  res.sendFile('views/index1.html',{root:__dirname});
})
app.post('/endpoint', function(req, res){

    if(!req.body.namena)
      {
        req.body.namena='Izdavanje';
      }
    if(!req.body.vrsta)
    {
      req.body.vrsta='stan';
    }
  var oglasi=db.collection('oglasi');
  oglasi.find({"ime":new RegExp(req.body.namena+req.body.vrsta)}).toArray(function(err,r)
  {
      if(r.length)
      {
        var sortOptions={};
        if(req.body.sort=="ascPrice")
        {
          sortOptions.cena=1;
        }
        else if(req.body.sort=="descPrice")
        {
          sortOptions.cena=-1;
        }
        else if(req.body.sort=='ascSize')
        {
          sortOptions.kvadratura=1;
        }
        else if(req.body.sort=='descSize')
        {
          sortOptions.kvadratura=-1;
        }
        else if(req.body.sort=='ascTime')
        {
          sortOptions.datum=1;
        }
        else if(req.body.sort=='descTime')
        {
          sortOptions.datum=-1;
        }
        else
        {
          sortOptions.cena=1;
        }
        var databaseIndex=req.body.namena+req.body.vrsta;
        var kolekcija=db.collection(databaseIndex);
        var brojac = 0;
        var queryObject ={};
        if(req.body.cena)
        {
          queryObject.cena={$gte:req.body.cena[0],$lte:req.body.cena[1]};//Formiram queyr samo ukoliko su parametri zadati za cenu
        }
        if(req.body.kvadratura)
        {
          queryObject.kvadratura={$gte:req.body.kvadratura[0],$lte:req.body.kvadratura[1]};//isto za kvadraturu
        }
        if(req.body.roomNumber)
        {
           if(req.body.roomNumber.length>0){
            queryObject.brojsoba={$in:req.body.roomNumber};//brojsoba
           }
        }


        var queryy = kolekcija.find(queryObject).sort(sortOptions);

        queryy.count(function (e, count)
        {
          queryy.skip(req.body.scroll*18-18).limit(18).toArray(function(err,re){

              var solv = {};
              solv.count = count;
              solv.oglasi = re;
              solv.session = req.session.user ? 1:0;
              //console.log(solv);
              res.send(JSON.stringify(solv))

          })

        })
      }

    });

});
app.post('/alertpoint',function(req,res)
{
  res.header('Access-Control-Allow-Credentials', 'true');
  console.log(req.session);
  if(req.session.user.email)
  {
    var users=db.collection("users");
    var alerts=db.collection('alerts');
    console.log(req.body)
    users.findOne({email:req.session.user.email},function(err,resp)//THISmight be stored in session so reqeust from database is not necessary
    {
      var obj={}
      obj.email=req.session.user.email;
      obj.userId=resp.id;
      if(req.body.cena)obj.cenalow=Number(req.body.cena[0]);
      if(req.body.cena)
      {
        if(req.body.cena[0])obj.cenalow=Number(req.body.cena[0]);
        if(req.body.cena[1])obj.cenahigh=Number(req.body.cena[1]);
      }
      if(req.body.kvadratura)
      {
        if(req.body.kvadratura[0])obj.kvadraturalow=Number(req.body.kvadratura[0]);
        if(req.body.kvadratura[1])obj.kvadraturahigh=Number(req.body.kvadratura[1]);
      }
      
      if(req.body.roomNumber)obj.brojsoba=Number(req.body.roomNumber);
      obj.vrsta=req.body.vrsta;
      obj.lokacija=req.body.lokacija;
      obj.namena=req.body.namena;
      obj.nazivAlerta=req.body.ime;
      console.log(obj);
      console.log('ovde sam');
      alerts.insert(obj,function(err)
      {
        if(err) {
          console.log(err)
        } else {
          res.end('1')
        }
      })
    })
  }
  else console.log('ALERTPOINTU FALI SESIJA KORISNIKA');
})
app.post('/getalerts', function(req,res)
{
  var alerts=db.collection('alerts');
  var matching
  var responseToUser={};

alerts.find({"email":req.session.user.email}).toArray(function(err,odg)
{

  if(odg.length)
  {
    matching=db.collection(odg[0].userId.toString());
  }
  else
  {
    console.log("No alerts added");
    res.send("-1");
    res.end();
  } 
/*
OPTIMIZACIJA BRISANJE PODATAKA KOJIH NE TREBA NA FRONTU
---JEDE PRENOS PODATAKA---
*/
  if(!odg)console.log('odg ne vaja');
      async.each(odg,function(alert,callb)
      {
        responseToUser[alert.nazivAlerta]=alert;
        matching.find({idalert:new ObjectId(odg._id),seen:0}).toArray(function(err,matchings)//DODAVANJE SKIPA OBAVEZNO
        {
          if(!matchings.length)console.log('Nije nadjen nijedan matching');
          console.log(matchings.length)
           responseToUser[alert.nazivAlerta].numberOfUnseenAds=matchings.length;
           callb();
        })

      },function(err)
      {
        res.send(responseToUser);
        res.end();
      })

  });
})
  app.post('/deletealert', function(req,res)
  {
    var alerts=db.collection('alerts');
    console.log(req.session.user.email);
    //console.log(req);
    //sql.select('delete FROM alerts WHERE email="'+req.session.user[0].email+'" AND id = '+req.body.id,function(odg) {
      console.log('delete')
      console.log(req.body);
      var id = req.body.id;
      var o_id = new ObjectId(id);
      alerts.deleteOne({"email":req.session.user.email,"_id":o_id},function(err,odg)
      {
        if(err)console.log(err)
          else
          {
            console.log('deleted');
            res.send(odg);
            res.end();
          }
        });
  });
  app.post('/givealerts',function(req,res)
  {
  
    var alerts=db.collection('alerts');
    
      var pageNum= req.body.pageNumAlert;
      pageNum= pageNum>0 ? pageNum:0;
      alerts.findOne({"_id":new ObjectId(req.body.idOfAlert)},function(err,alert)
      {
        var matching=db.collection(alert.userId.toString());//looking in the collection of only this user
        var cursor=matching.find({"idalert":new ObjectId(req.body.idOfAlert)});
        cursor.count(function(e,count)
        {
          cursor.sort({datum:-1,naslov:1}).skip(pageNum*18-18).limit(18).toArray(function(err,odg)
          {
            console.log(odg);
  
            if(odg.length)
            {
              var respObj={};
              respObj.numberOfAdverts=count;
              var data=[];
                
                async.each(odg,function(match,callback)
                {
                  var oglasi= db.collection(match.websitename);//OOV JE USTVARI KOJA TABELA SE UZIMA
                  oglasi.find({"link":match.idogl}).toArray(function(err,objToSend)
                  {
                    data.push({"seen":match.seen,"contentOfAdvert":objToSend[0]});
                    callback();
                    //samo gledam kad je kraj
                  })
                  match.seen=1;
                  matching.update({"_id":new ObjectId(match._id)},match,function(err,resp)
                  {
                    if(err)console.log(err);
                  })
              
              },function(err)
              {
                respObj.data=data;
                res.send(respObj);
                res.end();
              })
            }
            else
            {
              console.log("NISTA NIJE PRONADJENO");
              res.end();
            }
          })
      });
    })
  
  })
app.get('/logout',function(req,res)
{
  if(req.session.user) delete req.session.user;
  if(req.headers.aplikacija) {
    console.log('aplikacija')
    res.send('1')
  } else {
    res.writeHead(302,{'Location':'/login'})
  }
  res.end();

})
app.get('/css',function(req,res){
 res.sendFile('css/style.css',{root:__dirname});
});
