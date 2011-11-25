define(['js/NestedThreeChild'], function(NestedThreeChild) {
    var NestedThree = function() {};
    NestedThree.getName = function () {
        return "NestedThree";
    };
    NestedThree.Child = NestedThreeChild;
    return NestedThree;
});
