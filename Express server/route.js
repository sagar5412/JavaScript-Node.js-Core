import express from "express";
const app = express();
app.use(express.json());

// async function error handler - real world uses it.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// lodash.get - For safe property access returns null instead of undefined helps to prevent server crash

function get(obj, path, defaultValue) {
  const keys = path.split(".");
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) return defaultValue;
  }
  return result;
}

app.get(
  "/users",
  asyncHandler(async (req, res) => {
    // async db call
    throw new Error();
  })
);

app.get(
  "/",
  asyncHandler(async(req, res) => {
    // fetch inputs from body
    const username = get(req, "body.username", null);
    const result = await db.user.create({});
    // fetch data from db

    return res.json({
      msg: "get request",
      username
    });
  })
);

app.post(
  "/users",
  asyncHandler((req, res) => {
    // fetch inputs from body

    // put data into db

    return res.json({
      msg: "user created successfully",
    });
  })
);

app.get("/error", (req, res) => {
  throw new Error();
});

app.use((req, res, next) => {
  res.status(404).json({
    msg: "Route not found",
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({ msg: "Something went wrong" });
});

app.listen(3000);
