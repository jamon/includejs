define("js/NestedFive", ['js/NestedFiveChild'], function(NestedFiveChild) {
    var NestedFive = function() {};
    NestedFive.getName = function () {
        return "NestedFive";
    };
    NestedFive.Child = NestedFiveChild;
    return NestedFive;
});
define("js/NestedFiveChild", [], function() {
    var NestedFiveChild = function() {};
    NestedFiveChild.getTrue = function() {
        return true;
    };
    NestedFiveChild.getName = function () {
        return "NestedFiveChild";
    };
    return NestedFiveChild;
});
