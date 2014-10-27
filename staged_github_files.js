/*jshint node: true */

var _ = require('underscore');
var _s = require('underscore.string');
var exec = require('shelljs').exec;
var fs = require('fs');

var cachedFileList;

module.exports = {
    all: function() {
        var list;
        var response;

        // Return cache if we have one
        if (cachedFileList) {
            return cachedFileList;
        }

        response = exec('git status --porcelain -z', {silent: true, async: false}).output;
        list = _s.trim(response).split(/\0/);

        // Staged files
        list = _.filter(list, function(line) {
            return line.match(/^[AM]./);
        });

        // Remove prefixes
        list = _.map(list, function(line) {
            return line.substr(3);
        });

        // Expand paths
        list = _.flatten(_.compact(_.map(list, function(name) {
            if (name.match(/\/$/)) {
                return fs.readdirSync(name);
            } else {
                return name;
            }
        })));

        cachedFileList = list;

        return list;
    },

    filter: function(suffix) {
        suffix = _s.ltrim(suffix, '.');

        return _.filter(module.exports.all(), function(name) {
            return name.match(new RegExp('\\.' + suffix + '$'));
        });
    }
};
