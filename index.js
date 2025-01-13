const express = require("express");
const cookieParser = require("cookie-parser");
const { restrictToLoggedinUserOnly, checkAuth } = require("./middlewares/auth");

const path = require("path");
const { connectToMongoDB } = require("./connect");

const URL = require("./models/url");
const app = express();
const PORT = 8001;

const urlRoute = require("./routes/url");
const staticRouter = require("./routes/staticRouters");
const userRoute = require("./routes/user");

connectToMongoDB("mongodb://127.0.0.1:27017/short-url")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth, staticRouter);

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;

  try {
    const entry = await URL.findOneAndUpdate(
      {
        shortId,
      },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      }
    );

    if (!entry) {
      // If no entry found, return a 404 error or handle accordingly
      return res.status(404).send("URL not found");
    }

    // If the entry is found, redirect to the original URL
    res.redirect(entry.redirectURL);
  } catch (error) {
    // Catch any errors (e.g., database issues)
    console.error("Error during redirection:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => console.log(`Server started at port : ${PORT}`));
