describe('Include', function() {
/*    it('define calls factory', function() {
        var loaded = false;
        define([], function() {
            loaded = true;
        });
        waitsFor(function() { return loaded; }, "factory never called", 1000);
    }); */
    //it('doesnt fail when asked to include a simple script', function() {
    //    include(["js/Simple"], function() {});
    //});
    it('can include a simple script', function() {
        var loaded = false;
        include(["js/Simple"], function(simple) {
            loaded = true;
            expect(simple).toBeDefined();
            expect(simple.getTrue()).toBe(true);
            simple.ALREADYLOADED = true; // this is used by a later test to ensure we didn't reload the class
        });
        waitsFor(function() { return loaded; }, "Simple Include callback never called", 5000);
    });
    it('can include a script that includes other scripts', function() {
        var loaded = false;
        include(["js/Nested"], function(Nested) {
            loaded = true;
            expect(Nested).toBeDefined();
            expect(Nested.Child).toBeDefined();
            expect(Nested.getName()).toEqual("Nested");
            expect(Nested.Child.getName()).toEqual("NestedChild");
            expect(Nested.Child.getTrue()).toBe(true);
        });
        waitsFor(function() { return loaded; }, "Nested Include callback never called", 5000);
    });
    it('can include a script that includes two other scripts', function() {
        var loaded = false;
        include(["js/NestedTwo"], function(NestedTwo) {
            loaded = true;
            expect(NestedTwo).toBeDefined();
            expect(NestedTwo.NestedTwo1).toBeDefined();
            expect(NestedTwo.NestedTwo2).toBeDefined();
            expect(NestedTwo.getName()).toEqual("NestedTwo");
            expect(NestedTwo.NestedTwo1.getName()).toEqual("NestedTwo1");
            expect(NestedTwo.NestedTwo2.getName()).toEqual("NestedTwo2");
        });
        waitsFor(function() { return loaded; }, "Nested Include callback never called", 5000);
    });
    it('can include more than one script at a time', function() {
        var loaded = false;
        include(["js/Simple1", "js/Simple2"], function(simple1, simple2) {
            loaded = true;
            expect(simple1).toBeDefined();
            expect(simple1.getTrue()).toBe(true);
            expect(simple2).toBeDefined();
            expect(simple2.getTrue()).toBe(true);
        });
        waitsFor(function() { return loaded; }, "Simple Include callback never called", 5000);
    });
    it('can include a script that has already been loaded', function() {
        var loaded = false;
        include(["js/Simple"], function(simple) {
            loaded = true;
            expect(simple).toBeDefined();
            expect(simple.getTrue()).toBe(true);
            expect(simple.ALREADYLOADED).toBe(true); // This was set in a previous test to make sure we didn't re-load the class for this one.
        });
        waitsFor(function() { return loaded; }, "Simple Include callback never called", 5000);
    });
    it('can include a script and its dependency at the same time', function() {
        var loaded = false;
        include(["js/NestedThree", "js/NestedThreeChild"], function(NestedThree, NestedThreeChild) {
            loaded = true;
            expect(NestedThree).toBeDefined();
            expect(NestedThree.Child).toBeDefined();
            expect(NestedThree.getName()).toEqual("NestedThree");
            expect(NestedThree.Child.getName()).toEqual("NestedThreeChild");
            expect(NestedThree.Child.getTrue()).toBe(true);
        });
        waitsFor(function() { return loaded; }, "Nested Include callback never called", 5000);
    });
    it('can include a script and its dependency at the same time (child first)', function() {
        var loaded = false;
        include(["js/NestedFourChild", "js/NestedFour"], function(NestedFourChild, NestedFour) {
            loaded = true;
            expect(NestedFour).toBeDefined();
            expect(NestedFour.Child).toBeDefined();
            expect(NestedFour.getName()).toEqual("NestedFour");
            expect(NestedFour.Child.getName()).toEqual("NestedFourChild");
            expect(NestedFour.Child.getTrue()).toBe(true);
        });
        waitsFor(function() { return loaded; }, "Nested Include callback never called", 5000);
    });
    it('will call your error handler if a module fails to load', function() {
        var failed = false;
        include(["js/NonExistent"], function(NonExistent) {
            expect(true).toBe(false); // not sure of the right way of saying this code should never have been called.
        }, function() {
            failed = true;
        });
        waitsFor(function() { return failed; }, "Failure callback never called", 5000);
    });
    it('can include a script that is not wrapped within a define statement', function() {
        var loaded = false;
        include(["js/NotWrapped"], function() {
            loaded = true;
            expect(window.sofea.include.NotWrapped.getTrue()).toBe(true);
        });
        waitsFor(function() { return loaded; }, "Nested Include callback never called", 5000);
    });
});
