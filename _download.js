const https = require("https");
const fs = require("fs");

const url = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/0dd431c7-b7aa-4946-939a-90b2e953a2e5/nightvolt-black-1770554959998.png?width=8000&height=8000&resize=contain";

const file = fs.createWriteStream("public/nightvolt-logo.png");
https.get(url, (res) => {
  res.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Downloaded logo: " + fs.statSync("public/nightvolt-logo.png").size + " bytes");
  });
}).on("error", (e) => {
  console.error("Error:", e.message);
});
