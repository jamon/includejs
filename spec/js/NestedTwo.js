define(['js/NestedTwo1', 'js/NestedTwo2'], function(NestedTwo1, NestedTwo2) {
    var NestedTwo = function() {};
    NestedTwo.getName = function () {
        return "NestedTwo";
    };
    NestedTwo.NestedTwo1 = NestedTwo1;
    NestedTwo.NestedTwo2 = NestedTwo2;
    return NestedTwo;
});
