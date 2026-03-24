import app from "./src/app.js";
import config from "./src/config/config.js";
import dbConnect from "./src/config/dbConnection.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  /** Test db Connection */
  await dbConnect();
  app.listen(PORT, () => {
    console.log(`Server running in ${config.env} mode on port ${config.port}`);
  });
};
/** Start server */
startServer();
