define(['js/NestedFourChild'], function(NestedFourChild) {
    var NestedFour = function() {};
    NestedFour.getName = function () {
        return "NestedFour";
    };
    NestedFour.Child = NestedFourChild;
    return NestedFour;
});
