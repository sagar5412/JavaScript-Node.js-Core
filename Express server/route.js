import express from "express";
const app = express();
app.use(express.json())

app.get("/", (req, res) => {
  // fetch inputs from body

  // fetch data from db

  return res.json({
    msg: "get request",
  });
});

app.post("/users", (req, res) => {
  // fetch inputs from body

  // put data into db

  return res.json({
    msg: "user created successfully",
  });
});

app.get("/error",(req,res)=>{
    throw new Error;
})

app.use((req, res, next) => {
  res.status(404).json({
    msg: "Route not found",
  });
});

app.use((err, req, res, next) => {
  return res.json({
    msg:"something wrong"
  });
});

app.listen(3000)