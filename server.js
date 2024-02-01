import { createServer } from "http";
import app from "./app.js";
const port = process.env.PORT || 9000;

const server = createServer(app);
server.listen(port, () => {
  console.log('Server has been started to Port : ', port)
});