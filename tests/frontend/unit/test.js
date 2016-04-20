var requireFrom = require('require-from');
var path = require('path');

var assert = require('chai').assert;
var window = {};

var config = require('../config');


describe('test', function describe() {

    var legendRange = requireFrom('forTests', path.resolve(config.baseDir)+'/home/map/legend_range.js');

    it('should be test', function it() {
        assert.equal('abc', 'abc');
    });

    it('blabla', function() {

        var defaultConditions = [
            {"type":"simple","color":"#ff0000","value":"4","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"2","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"1","operation":"<="},
            {"type":"null","color":"#dddddd"},
            {"type":"simple","color":"#dddddd","value":"0","operation":"<="}
        ];

        var activeConditions = [];

        var disabledConditions = [
            {"type":"simple","color":"#ff0000","value":"4","operation":"<="},
            {"type":"simple","color":"#ffff00","value":"2","operation":"<="},
            {"type":"simple","color":"#80ff00","value":"1","operation":"<="},
            {"type":"null","color":"#dddddd"},
            {"type":"simple","color":"#e300ff","value":"0","operation":"<="}
        ];
        
        var completeConditions = [
            {"type":"simple","color":"#ff0000","value":"4","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"2","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"1","operation":"<="},
            {"type":"null","color":"#dddddd"},
            {"type":"simple","color":"#dddddd","value":"0","operation":"<="}
        ];
        
        legendRange.removeActiveCondition();

        assert.deepEqual();

    })
});