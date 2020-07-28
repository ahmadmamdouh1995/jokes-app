require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(express.json());


client.connect()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`I'm listinig to PORT ${PORT}`)
    })
})

// routs

app.get('/',homeHandler);
app.get('/list',listHandler);
app.get('/selectedJoke',selectedJokeHandler);
app.get('/details/:id',detailsHandler);
app.put('/update/:upId',updateHandler);
app.delete('/delete/:deleteId',deleteHandler)
app.get('/random', randomHandler);


// handler 

function homeHandler(req,res){
    let url  = `https://official-joke-api.appspot.com/jokes/programming/ten`;
    superagent.get(url)
    .then(data=>{
        let jokeArray = data.body.map(value=>{
            return new Joke(value)
        })
        res.render('index',{data : jokeArray})
    })

}

function listHandler(req,res){
    let {type , setup, punchline} = req.query;
    let sql = `INSERT INTO joke (type , setup ,punchline ) VALUES ($1,$2,$3);`;
    safeValues = [type , setup, punchline];
    client.query(sql,safeValues)
    .then(()=>{
        res.redirect('/selectedJoke')
    })
}

function selectedJokeHandler(req,res){
    let sql = `SELECT * FROM joke;`;
    client.query(sql)
    .then(result=>{
        res.render('pages/fav',{data : result.rows})
    })
}

function detailsHandler(req,res){
    let param = req.params.id;
    let sql = `SELECT * FROM joke WHERE id=$1;` ;
    let safeValues = [param];
    client.query(sql,safeValues)
    .then(result=>{
        res.render(`pages/details`,{data:result.rows[0]})
    })
}

function updateHandler (req,res){
    let param = req.params.upId;
    let {type , setup, punchline} = req.body;
    let sql = `UPDATE joke SET type=$1 , setup=$2 , punchline=$3 WHERE id=$4;`;
    let safeValues = [ type , setup, punchline ,param];
    client.query(sql,safeValues)
    .then(()=>{
        res.redirect(`/details/${param}`);
    })
}

function deleteHandler(req,res){
    let param = req.params.deleteId;
    let sql =`DELETE FROM joke WHERE id=$1;`;
    let safeValues = [param];
    client.query(sql,safeValues)
    .then(()=>{
        res.redirect('/selectedJoke');
    })
}
function randomHandler (req,res){
    let url  = `https://official-joke-api.appspot.com/jokes/programming/random`;
    superagent.get(url)
    .then(data=>{
        let jokeArray = data.body.map(value=>{
            return new Joke(value)
        })
        res.render('pages/random',{data : jokeArray})
    })
}

// constracter

function Joke(data){
    this.id = data.id;
    this.type = data.type;
    this.setup = data.setup;
    this.punchline = data.punchline;
}