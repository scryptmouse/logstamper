/**
 * logstamper
 * https://github.com/scryptmouse/logstamper
 *
 * Copyright (c) 2015 Alexa Grey
 * Licensed under the MIT license.
 */

'use strict';

var concat  = require('concat-stream')
  , cuid    = require('cuid')
  , events  = require('events')
  , moment  = require('moment')
  , sprintf = require('sprintf')
  , util    = require('util')
  , _       = require('lodash')
;

function LogStamper(options) {
  options       = options || {};

  events.EventEmitter.call(this);

  this.input    = options.input   || process.stdin;
  this.output   = options.output  || process.stdout;

  this.isStderr = !!options.stderr;

  if (!_.isEmpty(options.command)) {
    this.command = options.command;
  }

  this.cuid     = cuid();

  this.now      = moment();

  this.suffix   = sprintf('%s :: %s :: [[ %s ]]',
                        this.now.format(),
                        ( this.isStderr ? 'stderr' : 'stdout' ),
                        this.cuid
                       );
}

util.inherits(LogStamper, events.EventEmitter);

module.exports = LogStamper;

LogStamper.prototype.log = function LogStamper$log(line) {
  this.output.write(line + '\n');
};

LogStamper.prototype.print = function LogStamper$print(done) {
  var writer = concat(printOutput.bind(this));

  if (typeof done === 'function') {
    this.once('printed', done);
  }

  //this.input.on('error', handleError);
  this.input.pipe(writer);
};

function printOutput(input) {
  //jshint validthis:true

  input = input.toString();

  this.log(sprintf('==BEGIN== %s', this.suffix));

  if (this.command) {
    this.log(sprintf('--CMD: %s', this.command));
  }

  if (_.isEmpty(input)) {
    this.log('--EMPTY');
  } else {
    this.log(input);
  }

  this.log(sprintf('== END == %s', this.suffix));

  this.emit('printed');
}

function handleError(err) {
  console.error(err);
  process.exit(1);
}
