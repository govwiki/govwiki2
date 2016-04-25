var path = require('path');
var gutil = require('gulp-util');

var assert = require('chai').assert;

var config = require('../config');

describe('test', function describe() {

    var legendRange = require(path.resolve(config.baseDir)+'/home/map/legend_range.js');

    // All available conditions
    var defaultConditions;

    // Enabled conditions, by click
    var activeConditions = [];

    // Others must be placed there (diff defaultConditions, activeConditions)
    var disabledConditions = [];


    /**
     * Initialize variables before tests
     */
    before(function(){

        // App starts with set (All available conditions)
        defaultConditions = [
            {"type":"simple","color":"#ff0000","value":"4","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"2","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"1","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"0","operation":"<="},
            {"type":"null","color":"#dddddd"}
        ];

    });

    it('should enabled two layers (with value 4 and 1)', function() {
        activeConditions = [];
        disabledConditions = [];

        var expectedDisabledConditions = [
            {"type":"simple","color":"#dddddd","value":"2","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"0","operation":"<="},
            {"type":"null","color":"#dddddd"}
        ];

        // Click on layer button
        legendRange.addActiveCondition(activeConditions, defaultConditions[0]);
        // Click on layer button
        legendRange.addActiveCondition(activeConditions, defaultConditions[2]);

        disabledConditions = legendRange.findDisabledConditions(activeConditions, defaultConditions);

        assert.deepEqual(expectedDisabledConditions, disabledConditions);

    });

    it('should enabled null layer', function() {
        activeConditions = [];
        disabledConditions = [];

        var expectedDisabledConditions = [
            {"type":"simple","color":"#ff0000","value":"4","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"2","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"1","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"0","operation":"<="},
        ];

        // Click on layer button
        legendRange.addActiveCondition(activeConditions, defaultConditions[4]);

        disabledConditions = legendRange.findDisabledConditions(activeConditions, defaultConditions);

        assert.deepEqual(expectedDisabledConditions, disabledConditions);

    });

    it('should disabled three layers (with value 2 and 1)', function() {
        activeConditions = [
            {"type":"simple","color":"#ff0000","value":"4","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"2","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"1","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"0","operation":"<="},
            {"type":"null","color":"#dddddd"}
        ];
        disabledConditions = [];

        var expectedActiveConditions = [
            {"type":"simple","color":"#ff0000","value":"4","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"0","operation":"<="},
            {"type":"null","color":"#dddddd"}
        ];

        var expectedDisabledConditions = [
            {"type":"simple","color":"#dddddd","value":"2","operation":"<="},
            {"type":"simple","color":"#dddddd","value":"1","operation":"<="},
        ];

        // Click on layer button
        legendRange.removeActiveCondition(activeConditions, defaultConditions[1]);
        legendRange.removeActiveCondition(activeConditions, defaultConditions[2]);

        disabledConditions = legendRange.findDisabledConditions(activeConditions, defaultConditions);

        assert.deepEqual(expectedDisabledConditions, disabledConditions);
        assert.deepEqual(expectedActiveConditions, activeConditions);

    });

});