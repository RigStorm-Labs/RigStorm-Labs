const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

//app.use(express.json({ limit: "200mb" }));
app.use(express.static("./"));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: "200mb"
}));
/*
// allow cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/
function sanitizeFileName(file, allowedExtension = 'html') {
    const basename = path.basename(file);
    const disallow = ['.htaccess', 'passwd'];
    if (disallow.includes(basename)) {
        console.error('Filename not allowed!');
        return '';
    }
    
    // sanitize, remove double dot .. and remove get parameters if any
    file = file.replace(/\?.*$/, '')
               .replace(/\.{2,}/g, '')
               .replace(/[^\/\\a-zA-Z0-9\-\._]/g, '');
    
    if (file) {
        file = path.join(__dirname, file);
    } else {
        return '';
    }
    
    // allow only specified extension
    if (allowedExtension) {
        const ext = path.extname(file);
        if (ext) {
            file = file.slice(0, -ext.length);
        }
        file = `${file}.${allowedExtension}`;
    }
    
    return file;
}

app.post('/save.php', (req, res) => {
  let { file, action, startTemplateUrl, html } = req.body;

  let result = "Error saving file!";
  file = sanitizeFileName(file);

  if (file && html) {
	try {
	  fs.writeFileSync(file, html);
	  result = "File saved!";
	} catch (err) {
	  console.error(err);
	}
  }

  res.send(result);
});
 
app.listen(8080, () => {
  console.log('Started');
});
