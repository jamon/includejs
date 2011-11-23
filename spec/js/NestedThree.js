define(['js/NestedThreeChild'], function(NestedThreeChild) {
    console.log(NestedThreeChild);
    var NestedThree = function() {};
    NestedThree.getName = function () {
        return "NestedThree";
    };
    NestedThree.Child = NestedThreeChild;
    return NestedThree;
});
