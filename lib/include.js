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
if(typeof sofea === "undefined") {
    var sofea = {};
}
sofea.include = (function(undefined) {
    var STATE = {requested: 0, loading: 1, loaded: 2, ready: 3, error: 4};
    var I = function() {};
    I.amd = {}; // specify that we implement the AMD spec
    I.modules = {};
    I.lastDefined = null;
    I.config = {paths: {}, baseDir: "./"};

    I.include = function(deps, callback, errorCallback) {
        var counter = deps.length;
        var checkComplete = function() {
            if(--counter === 0) {
                var depResults = [];
                for(var i = 0; i < deps.length; i++) {
                    var definition = I.modules[deps[i]].definition;
                    depResults[i] = definition;
                }
                callback.apply(null, depResults);
            }
        };
        for(var i = 0; i < deps.length; i++) {
            var depName = deps[i];
            if(typeof I.modules[depName] === "undefined") {
                I.modules[depName] = {name: depName, state: STATE.requested, onReady: [checkComplete], onError: [errorCallback]};
                I.load(I.modules[depName]);
            } else {
                if(I.modules[depName].state === STATE.ready) {
                    checkComplete();
                } else if(I.modules[depName].state === STATE.error) {
                    errorCallback(I.modules[depName].error);
                } else {
                    I.modules[depName].onReady.push(checkComplete);
                    I.modules[depName].onError.push(errorCallback);
                }
            }
        }
    };
/*
    I.suspend = function() {
        I.suspended = true;
        I.loadedWhileSuspended = [];
    };
    I.resume = function() {
        for(var i = 0 ; i < I.loadedWhileSuspended.length; i++) {
        }
        I.suspended = false;
    };
*/
    I.error = function(dep) {
        if(dep.state === STATE.error) return; // don't call error callbacks more than once.
        dep.state = STATE.error;
        dep.error = Array.prototype.slice(arguments, 1);
        dep.error['name'] = dep.name;
        for(var i = 0; i < dep.onError.length; i++) {
            if(typeof dep.onError[i] === 'function') dep.onError[i](dep.error);
        }
    };
    I.complete = function(dep) {
        dep.state = STATE.ready;
        for(var i = 0; i < dep.onReady.length; i++) {
            dep.onReady[i]();
        }
    };
    I.load = function(dep) {
        var script = document.createElement('script');
        script.type = "text/javascript";
        var baseDir = I.config.baseDir;
        var depName = dep.name;
        var pathParts = depName.split("/");
        if(pathParts.length > 1) {
            if(typeof I.config.paths[pathParts[0]] !== "undefined") {
                baseDir = I.config.paths[pathParts.shift()];
                depName = pathParts.join("/");
            }
        }
        var fname = depName.split(".");
        script.src = baseDir + dep.name + (fname[fname.length-1] === "js" ? "" : ".js");
        if(typeof script.addEventListener !== "undefined") {
            script.addEventListener('error', function() {
                I.error(dep, arguments);
            }, true);
        }
        script.onload = script.onreadystatechange = function () {
            if (typeof this.readyState === "undefined" || /loaded|complete/.test(this.readyState)) {
                script.onload = script.onreadystatechange = null;
                I.onLoad(dep);
            }
        };
        document.getElementsByTagName("head")[0].appendChild(script);
    };
    I.define = function() {
        var len = arguments.length;
        var dep = {
            name: len >= 3 ? arguments[len-3] : null,
            deps: len >= 2 ? arguments[len-2] : [],
            definition: arguments[len-1],
            state: STATE.loaded,
            onReady: [],
            onError: []
        };
        if(dep.name !== null) {
            I.modules[dep.name] = dep;
        } else {
            I.lastDefined = dep;
        }
    };
    I.onLoad = function(dep) {
        var lastDefined = I.lastDefined;
        I.lastDefined = null;
        if(typeof lastDefined !== "undefined" && lastDefined !== null) {
            if(lastDefined.deps.length === 0) {
                dep.definition = lastDefined.definition();
                I.complete(dep);
            } else {
                dep.state = STATE.loaded;
                I.include(lastDefined.deps, function() {
                    dep.definition = lastDefined.definition.apply(null, arguments);
                    I.complete(dep);
                });
            }
        } else {
            I.complete(dep);
        }
    };
    return I;
})();

var include = sofea.include.include;
var require = sofea.include.include;
var define = sofea.include.define;
