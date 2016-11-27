'use strict';

const util = require('util');
const path = require('path');
const Readable = require('stream').Readable;
const dateformat = require('dateformat');
const randomstring = require("randomstring");
const Change = require('chance');

var VERSION = "1.0.0";
var EXTENSION = '.csv';
var NEW_LINE_CTRL = '\n';

module.exports = CsvGenerator;

function CsvGenerator(options) {
  this.options = options;
  this.change = new Change();
  Readable.call(this, {});
}

CsvGenerator.prototype.version = function() {
  return VERSION;
}

CsvGenerator.prototype._read = function() {
  this.push(this.writeHeader());
  this.push(this.writeBody());
  this.push(null)
}

CsvGenerator.prototype.writeHeader = function() {
  if (this.options.header.quotes)
    return "\"" + this.options.header.title.join("\",\"") + "\"" + NEW_LINE_CTRL;
  return this.options.header.title + NEW_LINE_CTRL;
}

CsvGenerator.prototype.writeBody = function() {
  var i = 0;

  // iterate over rows
  do {
    i += 1;

    // iterate over columns
    for (var j = 0; j < this.options.rows.length; j++) {
      this.push(this[this.options.rows[j].type](this.options.rows[j].options));
      if (j != this.options.rows.length - 1)
        this.push(this.options.delimiter);
    }

    if (i != this.options.length)
      this.push('\n');
  } while (i < this.options.length);
}

CsvGenerator.prototype.date = function(opt) {
  return dateformat(new Date(), opt.format);
}

CsvGenerator.prototype.string = function(opt) {
  return randomstring.generate(opt.length);
}

CsvGenerator.prototype.int = function(opt) {
  return '' + this.change.integer(opt);
}

CsvGenerator.prototype.float = function(opt) {
  return '' + this.change.floating(opt);
}

CsvGenerator.prototype.fileName = function(date) {
  var dt = dateformat(date, this.options.output.suffix);
  return path.join(this.options.output.folder, this.options.output.prefix + dt + '.csv');
}

util.inherits(CsvGenerator, Readable);
