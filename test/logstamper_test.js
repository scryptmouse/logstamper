'use strict';

var LogStamper  = require('../lib/logstamper.js')
  , stream      = require('mock-utf8-stream')
  , StringStream  = require('string-stream')
;

var BEGIN = '==BEGIN=='
  , EMPTY = '--EMPTY'
  , END   = '== END =='
;

function contains(string, needle) {
  return !!~string.indexOf(needle);
}

exports['logging'] = {
  setUp: function(done) {
    this.stdin    = new StringStream();
    this.stdout   = new stream.MockWritableStream();
    this.stamper  = new LogStamper({input: this.stdin, output: this.stdout});
    // setup here
    done();
  },
  'empty input': function(test) {
    test.expect(3);
    // tests here
    this.stdout.startCapture();
    this.stamper.print(function() {
      var output = this.stdout.capturedData;
      test.ok(contains(output, BEGIN));
      test.ok(contains(output, EMPTY), 'logs that input was empty');
      test.ok(contains(output, END));
      test.done();
    }.bind(this));
  },
};
