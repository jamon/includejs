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
// @TODO remove all //console.log's, decide if we want to expose a minimalist log API
// @TODO add api for printing a dependency tree graph
if(typeof sofea === "undefined") {
    var sofea = {};
}
sofea.include = (function(undefined) {
    var STATE = {requested: 0, loading: 1, loaded: 2, ready: 3, error: 4};
    var I = function() {};
    I.modules = {};
    I.lastDefined = null;
    I.config = {baseDir: "./"};

    I.include = function(deps, callback) {
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
                I.modules[depName] = {name: depName, state: STATE.requested, onReady: [checkComplete], onError: []};

                I.load(I.modules[depName]);
            } else {
                if(I.modules[depName].state === STATE.ready) {
                    checkComplete();
                } else {
                    I.modules[depName].onReady.push(checkComplete);
                }
            }
        }
    };

    // @TODO add support for suspend/resume for combining modules into a single file.
    //I.suspend = function() {
    //    I.suspended = true;
    //    I.loadedWhileSuspended = [];
    //};
    //I.resume = function() {
    //    for(var i = 0 ; i < I.loadedWhileSuspended.length; i++) {
    //
    //    I.suspended = false;
    //};
    I.load = function(dep) {
        var script = document.createElement('script');
        script.type = "text/javascript";
        script.src = I.config.baseDir + dep.name + ".js";
// @TODO add error handler support back in
//        script.addEventListener('error', function() {
//            //console.log("ERROR loading " + module.name + " from " + module.location);
//        }, true);
        script.onload = script.onreadystatechange = function () {
            if (typeof this.readyState === "undefined" || /loaded|complete/.test(this.readyState)) {
                script.onload = script.onreadystatechange = null;
            }
            I.onLoad(dep);
        };
        document.getElementsByTagName("head")[0].appendChild(script);
    };
    I.define = function() {
        var len = arguments.length;
        I.lastDefined = {
            depName: len >= 3 ? arguments[len-3] : null,
            deps: len >= 2 ? arguments[len-2] : [],
            definition: arguments[len-1]
        };
    };
    I.onLoad = function(dep) {
        var lastDefined = I.lastDefined;
        var onComplete = function() {
            dep.state = STATE.ready;
            for(var i = 0; i < dep.onReady.length; i++) {
                dep.onReady[i]();
            }
        }
        if(typeof lastDefined !== null) {
            if(lastDefined.deps.length === 0) {
                dep.definition = lastDefined.definition();
                onComplete();
            } else {
                dep.state = STATE.loaded;
                I.include(lastDefined.deps, function() {
                    dep.definition = lastDefined.definition.apply(null, arguments);
                    onComplete();
                });
            }
        } else {
            onComplete();
        }
    };

    return I;
})();

var include = sofea.include.include;
var define = sofea.include.define;
