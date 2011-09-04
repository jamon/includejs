/*jslint onevar: false, plusplus: false, forin: false  */
/*
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/

 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 * 
 * Contributor(s): 
 *   Jamon Terrell <jamon@sofea.net>
 *   Petar Strinic <petar@sofea.net>
*/
(function (window) {
    var ann = function(funcName, func) {
        //console.log("annotating: ", funcName);
        return function() {
            //console.log([funcName, "IN",  Array.prototype.slice.call(arguments,0)]);
            var result = func.apply(this, arguments);
            //console.log([funcName, "OUT", Array.prototype.slice.call(arguments,0), result]);
            return result;
        };
    };
    var Include = function() {};

    Include.modules = {};
    Include.observers = {};

    Include.config = function (config) {
        if (typeof config["default"] === "undefined") {
            throw "Invalid Include configuration: no default configuration specified.";
        }
        Include.config = config;
    };
    Include.isLoaded = function (moduleName) {
        return typeof Include.modules[moduleName] !== "undefined" || Include.modules[moduleName].isLoaded();
    };

    Include.include = function(moduleNames) {
        var module = Include.module(moduleNames);
        module.load();
        return module;
    };
    Include.module = function(moduleNames) {
        var module;
        //console.log("Include.module", moduleNames);
        if(typeof moduleNames === "string") {
            if(typeof Include.modules[moduleNames] !== "undefined") {
                module = Include.modules[moduleNames];
                //console.log("Include.module: module already exists " + moduleNames + " = ", module);
            } else if (moduleNames.indexOf("!") === -1) {
                module = new Module(moduleNames);
                Include.modules[moduleNames] = module;
                //console.log("Include.module: creating module " + moduleNames + " = ", module);
            } else {
                var s = moduleNames.split("!");
                throw "Packages not yet implemented";
                //module = new ();
            }
        } else {
            //console.log("not a string");
            module = new Module();
            for(var i in moduleNames) {
                module.depend(moduleNames[i]);
            }
        }
        //console.log("module", module);
        return module;
    };
    Include.define = function(moduleResult) {
        Include.lastDefined = moduleResult;
    };
    Include.getDefined = function() {
        var res = Include.lastDefined;
        delete Include.lastDefined;
        return res;
    };
var idCounter = 0;
    var Module = function(name) {
        this.id = ++idCounter;
        //console.log(this.id, name, "creating module", this);
        this.binds = {};
        this.deps = {};
        if(typeof name !== "undefined") {
            this.name = name;
        }
    };
    Module.prototype.loaded = false;
    Module.prototype.failed = false;
    Module.prototype.loading = false;
    Module.prototype.ready = false;
    Module.prototype.on = function(e, cb) {
        if(e === 'ready' && this.isReady()) { cb(this); return this; }
        if(e === 'error' && this.isFailed()) { cb(this); return this; }
        if(typeof this.binds[e] === "undefined") this.binds[e] = [];
        this.binds[e].push(cb);
        return this;
    };

    Module.prototype.emit = function(e, data) {
        var that = this;
        //console.log(this.id, "emit", this.binds, e, data);
        while(typeof this.binds[e] !== "undefined" && this.binds[e].length > 0) {
            //console.log(this.id, "calling...", data);
            this.binds[e].pop().call(that, data);
        }
    };

    Module.prototype.isLoaded = function() {
        return this.loaded;
    };
    Module.prototype.isFailed = function() {
        return this.failed;
    };
    Module.prototype.isLoading = function() {
        return this.loading;
    };
    Module.prototype.isReady = function() {
        return this.ready;
    };
    Module.prototype.depend = function(depName) {
        //console.log(this.id, "adding dependency: ", this, depName);
        this.deps[depName] = Include.module(depName);
    };

    Module.prototype.areDependenciesReady = function() {
        for(var depName in this.deps) {
            if(!this.deps[depName].isReady()) return false;
        }
        return true;
    };
    Module.prototype.load = function () {
        var that = this;
        //console.log(this.id, "attempting to load module ", this);
        if(this.isReady()) {  // @TODO maybe remove this
            //console.log("THIS WASNT USELESS");
            this.emit('ready', this);
            return this;
        } else if(this.isLoading()) {
            //console.log(this.id, "already loading...", this);
            return this;
        }
        //console.log(this.id, "are dependenciesloaded", this.areDependenciesLoaded());
        this.checkDependenciesAndLoad();
        this.loadDependencies();
    };
    Module.prototype.loadDependencies = function() {
        // @TODO not sure why I can't just call that.checkDependenciesAndLoad directly
        var cdal = function() { that.checkDependenciesAndLoad(); };
        for(var dep in this.deps) {
            //console.log(this.id, "checking if dep is loaded: ", dep);
            if(!this.deps[dep].isReady() && !this.deps[dep].isLoading()) {
                //console.log(this.id, "calling Include.include: ", dep);
                Include.include(dep).on('ready', cdal );
            }
        }
    };
    Module.prototype.checkDependenciesAndLoad = function() {
        var that = this;
        console.log(this.id, "check dependencies and load", this.areDependenciesReady(), this);
        if(this.areDependenciesReady()) {
            if(typeof this.name === "undefined") {
                this.setLoaded();
                this.setReady();
            } else {
                this.include(function() {
                    if(typeof that.module !== "undefined") {
                        that.mod = that.module();
                        that.setLoaded();
                        that.setReady();
                    } else {  // module not managed by include.js
                        that.setReady();
                        that.setLoaded();
                    }
                });
            }
        }

    };
    Module.prototype.setReady = function() {
        this.ready = true;
        this.emit('ready', this);
    };
    Module.prototype.setLoaded = function() {
        //console.log(this.id, this.name, "setting loaded");
        this.loaded = true;
    };
    Module.prototype.getScriptLocation = function() {
        return this.name + ".js";
    };

    Module.prototype.include = function(cb) {
        //console.log(this.id, "Module.prototype.include", this);
        if(this.isLoaded()) { cb(); return; }
        if(this.isLoading()) return;
        this.loading = true;
        var that = this;
        var scriptLocation, script;
        script = document.createElement('script');
        script.type = "text/javascript";
        script.src = this.getScriptLocation();
        script.addEventListener('error', function() {
            //console.log("ERROR loading: ", script.src);
            that.emit('error', that);
        }, true);
        script.onload = script.onreadystatechange = function () {
            //if (pkg.state !== "READY") {
                ////console.log("readystate", this.readyState);
                if (typeof this.readyState === "undefined" || /loaded|complete/.test(this.readyState)) {
                    script.onload = script.onreadystatechange = null;
                    that.module = Include.getDefined();
                    cb();
                }
            //}
        };
        //script.setAttribute('async', 'true');
        document.getElementsByTagName("head")[0].appendChild(script);
    };

    // include(['foo/bar'])
    //   .on("load", function() {})
    //   .on("error", function() {});

    // include(['foo/one']).on("load", function(include(['foo/two']))
    // a
    //  + b
    //  + c
    //    + d
    //    + e
    // x
    // y
    // z

    // Include.module('a').depend(['b','c']);
    // Include.module('c').depend(['d','e']);

    // include(['a','x','y','z']).on(function($i) { } );
    // return new Include.Package();


    // include('foo/one').then('foo/two').then('foo/three').on('load', function() {})

    window.include = Include.include;
    window.define = Include.define;
})(window);
