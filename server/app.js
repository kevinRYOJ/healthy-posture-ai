const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.post("/predict", (req, res) => {
  const { total_sitting } = req.body;

  let risk = "Low";

  if (total_sitting > 480) risk = "High";
  else if (total_sitting > 240) risk = "Medium";

  res.json({ risk });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});