define([], function() {
    var NestedThreeChild = function() {};
    NestedThreeChild.getTrue = function() {
        return true;
    };
    NestedThreeChild.getName = function () {
        return "NestedThreeChild";
    };
    return NestedThreeChild;
});
