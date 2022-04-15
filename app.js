const express = require("express");
const logger = require("morgan");
const createHTTPError = require("http-errors");
const multer = require("multer");
const path = require("path");

const app = express();
const VIEWS = path.resolve(__dirname, "views");
const STATIC_FILES = path.resolve(__dirname, "static");
const max_image_size = 1024 * 1024 //1MB
const storage = multer.diskStorage({
    destination: function (request, file, callback){
        callback(null, "./uploads");
    },

    filename: function (request, file, callback){
        const today = new Date();
        callback(null, today.getTime()+"_"+file.originalname);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: function (request, file, callback){
        const ext = file.mimetype.split("/")[1];

        if(ext === "jpg" || ext === "jpeg" || ext === "png"){
            callback(null, true);
        } else {
            callback(null, true);
            return callback(new Error("Only images are allowed"));
        }
    },
    limits: {
        fileSize: max_image_size
    }

}).single("image");

app.set("port", process.env.PORT || 5000);
app.set("views", VIEWS);
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.static(STATIC_FILES));
app.use(express.urlencoded({extended: true}));


app.get("/", function(request, response){
    response.render("index");
});
app.post("/upload",upload, function(request, response, next){
    if(!request.file){
        return next(createHTTPError(400, "No file provided"));
    }
    response.send(request.file);
    response.json({
        success: true,
        payload: request.file
    })
})

app.use(function ( request, response, next) {
    next(createHTTPError(404));
});

app.use(function (error, request, response, next) {
    response.json({
        error:{
            status: error.status,
            message: error.message
        }
    })
});


app.listen(app.get("port"), () => {
    console.log("express server is running on port: "+app.get("port"));
})