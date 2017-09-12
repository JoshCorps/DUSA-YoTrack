var exports = module.exports = {};
exports.initialise = initialise;
exports.controller = controller;

function controller(path) {
    let obj = {}
    obj.path = path;
    obj.name = "Controller serving " + path;
    obj.get = function(req, res){res.status(404); res.send("Empty. Controller: " + this.name);};
    obj.post = function(req, res){res.status(404); res.send("Empty. Controller: " + this.name);};
    return obj;
}

var controllers = [];

//returns last index
function addController(path)
{
    var lastIndex = controllers.push(controller(path)) - 1; //-1 to get last index
    console.log(lastIndex);
    return lastIndex;
}

//define the controllers here
function defineControllers()
{
    var last = addController('/upload');
    controllers[last].get = function(req, res) { res.send('Upload Test.'); }

}

function initialise(app){
    defineControllers();
    for (var i = 0; i < controllers.length; i++) {
        app.get(controllers[i].path, controllers[i].get);
        app.post(controllers[i].path, controllers[i].post);
    }
}

/*
function getController(name)
{
    for (var i = 0, len = controllers.length; i < len; i++) {
        if (controllers[i].name === name)
        {
            return controllers[i];
        }
    }
    return new controller('Not found');
}
*/