import app from './index.js'
const port = 8080;

app.addEventListener(
  "listen",
  ({ port }) => console.log(`listening on port: ${port}`),
);
console.log(Deno.cwd())
await app.listen({ port });