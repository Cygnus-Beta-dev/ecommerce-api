import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, "../../");

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({ path: join(projectRoot, envFile) });
//dotenv.config({ path: join(projectRoot, ".env"), override: true });

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
};

export default config;