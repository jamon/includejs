define(['js/NestedChild'], function(NestedChild) {
    var Nested = function() {};
    Nested.getName = function () {
        return "Nested";
    };
    Nested.Child = NestedChild;
    return Nested;
});
