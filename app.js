const express=require('express')
const app=express()
const crypto=require('node:crypto')
const movies=require('./movies.json')
const {validateMovie, validatePartialMovie} =require('./MovieSchema')
const z=require('zod')
const PORT=process.env.PORT ?? 1234
app.disable('x-powered-by')
app.use(express.json())
const cors=require('cors')

app.use(cors({ origin:(origin,callback)=>{
    const ACCEPTED_ORIGINS=[
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:1234'

]
    if(ACCEPTED_ORIGINS.includes(origin)){
        return callback(null,true)
    }
    if(!origin){
        return callback(null,true)
    } 
    return callback(new Error('Not allowed by CORS'))
}
     

}))


app.get('/movies',(req,res)=>{
   // res.header('Access-Control-Allow-Origin','http://localhost:3000')
        const {genre}=req.query
        if (genre){
            const filtermovies=movies.filter(
                movie=>movie.genre.some(g=>g.toLowerCase()==genre.toLowerCase())
            )
            return res.json(filtermovies)
        }
        res.json(movies)
    //res.json({message:'hola mundo'})
})
/* app.get('/movies',(req,res)=>{
    res.json(movies)
}) */
app.get('/movies/:id',(req,res)=>{
    const {id} =req.params
    const movie=movies.find(movie=>movie.id=id)
    if(movie) return res.json(movie)
    res.status(404).json({message:'Movie not found'})
})
// validacin con zod

app.post('/movies',(req,res)=>{
    const result=validateMovie(req.body)
     if (result.error){
        return res.status(400).json({error: JSON.parse(result.error.message)})
     }
    const newmovie={
        id:crypto.randomUUID(),
        ...result.data

    }
    movies.push(newmovie)
    res.status(201).json(newmovie)

})
app.delete('/movies/:id',(req,res)=>{
    
    const {id}=req.params
    const movieIndex=movies.findIndex(movie=>movie.id==id)
    if(movieIndex==-1){
        return res.status(404).json({message:'Movie not found'})

    }
    movies.splice(movieIndex,1)
    return res.json({message: 'Movie deleted'})
})

app.patch('/movies/:id',(req,res)=>{
    
    const result=validatePartialMovie(req.body)
    const {id}=req.params
    const movieIndex=movies.findIndex(movie=>movie.id==id)
    
    if(movieIndex==-1) return res.status(404).json({message:'movie not found'}) 

    const updateMovie={
        ...movies[movieIndex],
        ...result.data
    }
    movies[movieIndex]=updateMovie
    return res.json(updateMovie)
})
/* 
app.options('/movies/:id',(req,res)=>{
    const origin=req.header('origin')
    if (ACCEPTED_ORIGINS.includes(origin) ||  !origin){
        res.header('Access-Control-Allow-Origin',origin)
        res.header('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE')
    }
    res.send(200)

})  */

app.listen(PORT,()=>{
    console.log('server listening on port: ',PORT)
})