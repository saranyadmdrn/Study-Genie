function onListening(){var e=server.address(),r="string"==typeof e?"pipe "+e:"port "+e.port;debug("Listening on "+r),console.log("Listening on "+r)}var app=require("../app"),debug=require("debug")("ng-notes:server"),http=require("http"),port=process.env.PORT||7001;app.set("port",port);var server=http.createServer(app);server.listen(port),server.on("listening",onListening);