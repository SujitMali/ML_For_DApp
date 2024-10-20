const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { spawn, exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON bodies

mongoose
  .connect(
    "mongodb+srv://sujit123:GYVG7fMa8XIyFYUh@sujitcluster.hnugl.mongodb.net/?retryWrites=true&w=majority&appName=sujitcluster"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  goal: { type: String, default: "0" },
  pledged: { type: String, default: "0" },
  startDate: { type: String },
  endDate: { type: String },
  owner: { type: String, required: true },
  status: { type: String, default: "active" },
});

const Campaign = mongoose.model("Campaign", campaignSchema);

app.post("/api/campaigns", async (req, res) => {
  try {
    const campaign = new Campaign(req.body);
    await campaign.save();
    res
      .status(201)
      .json({ message: "Campaign created successfully!", campaign });
  } catch (error) {
    console.error("Error saving campaign:", error);
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { title, text } = req.body;
    exec(
      `python sentiment_analysis.py ${title} ${text}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error analyzing data:", error);
          res.status(400).json({ error: error.message });
          return;
        }
        const data = JSON.parse(stdout);
        return res
          .status(200)
          .json({ message: "Data analyzed successfully!", data });
      }
    );
  } catch (error) {
    console.error("Error analyzing data:", error);
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
