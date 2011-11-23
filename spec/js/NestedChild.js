define([], function() {
    var NestedChild = function() {};
    NestedChild.getTrue = function() {
        return true;
    };
    NestedChild.getName = function () {
        return "NestedChild";
    };
    return NestedChild;
});
