/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 *
 * Copyright (c) 2017 Sony Global Education, Inc.
 */

'use strict';
const bilbinary = require('../bilbinary.js'),
      assert = require('assert');

const conversion_test = (script, binary) => {
  const text = JSON.stringify(script);
  const b = new Buffer(binary);
  describe(`serialize ${script}`, function() {
    const trans = bilbinary.translator(script);

    it(`should be ${text} in binary format`, function() {
      assert.deepEqual(trans.translate(), b);
    });
  });
  describe(`deserialize ${text} in binary form`, function() {
    const trans = bilbinary.translator();

    it(`should be ${text}`, function() {
      assert.deepEqual(trans.deserialize(b), script);
    });
  });
};

conversion_test({}, [ 0x02, 0x00 ]);
conversion_test([], [ 0x02, 0x00 ]);
conversion_test({ x: {} }, [ 0x07, 0x00, 0x03, 0x22, 0x00, 0x02, 0x00 ]);
conversion_test({ x: [] }, [ 0x07, 0x00, 0x04, 0x22, 0x00, 0x02, 0x00 ]);
conversion_test({ x: 2 }, [ 0x06, 0x00, 0x05, 0x22, 0x00, 0x02 ]);
conversion_test({ x: 127 }, [ 0x06, 0x00, 0x05, 0x22, 0x00, 0x7f ]);
conversion_test({ x: -128 }, [ 0x06, 0x00, 0x05, 0x22, 0x00, 0x80 ]);
conversion_test({ x: 128 }, [ 0x07, 0x00, 0x06, 0x22, 0x00, 0x80, 0x00 ]);
conversion_test({ x: -129 }, [ 0x07, 0x00, 0x06, 0x22, 0x00, 0x7f, 0xff ]);
conversion_test({ x: 32767 }, [ 0x07, 0x00, 0x06, 0x22, 0x00, 0xff, 0x7f ]);
conversion_test({ x: -32768 }, [ 0x07, 0x00, 0x06, 0x22, 0x00, 0x00, 0x80 ]);
conversion_test({ x: 32768 }, [
  // 32bit
  // 0x09, 0x00, 0x07, 0x22,
  // 0x00, 0x00, 0x80, 0x00, 0x00
  // float
  0x09, 0x00, 0x01, 0x22,
  0x00, 0x00, 0x00, 0x00, 0x47
]);
conversion_test({ x: -32769 }, [
  // 32bit
  // 0x09, 0x00, 0x07, 0x22,
  // 0x00, 0xff, 0x7f, 0xff, 0xff
  // float
  0x09, 0x00, 0x01, 0x22,
  0x00, 0x00, 0x01, 0x00, 0xc7
]);
conversion_test({ x: 8388607 }, [
  // 32bit
  // 0x09, 0x00, 0x07, 0x22,
  // 0x00, 0xff, 0xff, 0x7f, 0x00
  // float
  0x09, 0x00, 0x01, 0x22,
  0x00, 0xfe, 0xff, 0xff, 0x4a
]);
conversion_test({ x: -8388608 }, [
  // 32bit
  // 0x09, 0x00, 0x07, 0x22,
  // 0x00, 0x00, 0x00, 0x80, 0xff
  0x09, 0x00, 0x01, 0x22,
  0x00, 0x00, 0x00, 0x00, 0xcb
]);

describe('translate { x: 2147483647 }', function() {
  const trans = bilbinary.translator({ x: 2147483647 });

  it('should be { x: 2147483647 } in binary format', function() {
    assert.deepEqual(trans.translate(), new Buffer([
      // 32bit
      // 0x09, 0x00, 0x07, 0x22,
      // 0x00, 0xff, 0xff, 0xff, 0x7f
      // float
      0x09, 0x00, 0x01, 0x22,
      0x00, 0x00, 0x00, 0x00, 0x4f
    ]));
  });
});

describe('translate { x: -2147483648 }', function() {
  const trans = bilbinary.translator({ x: -2147483648 });

  it('should be { x: -2147483648 } in binary format', function() {
    assert.deepEqual(trans.translate(), new Buffer([
      // 32bit
      // 0x09, 0x00, 0x07, 0x22,
      // 0x00, 0x00, 0x00, 0x00, 0x80
      // float
      0x09, 0x00, 0x01, 0x22,
      0x00, 0x00, 0x00, 0x00, 0xcf
    ]));
  });
});

describe('translate { x: 2147483648 }', function() {
  const trans = bilbinary.translator({ x: 2147483648 });

  it('should be { x: 2147483648 } in binary format', function() {
    assert.deepEqual(trans.translate(), new Buffer([
      // float
      0x09, 0x00, 0x01, 0x22,
      0x00, 0x00, 0x00, 0x00, 0x4f
    ]));
  });
});

describe('translate { x: -2147483649 }', function() {
  const trans = bilbinary.translator({ x: -2147483649 });

  it('should be { x: -2147483649 } in binary format', function() {
    assert.deepEqual(trans.translate(), new Buffer([
      // float
      0x09, 0x00, 0x01, 0x22,
      0x00, 0x00, 0x00, 0x00, 0xcf
    ]));
  });
});

conversion_test({ x: "x" }, [
  0x07, 0x00, 0x02, 0x22,
  0x00, 0x22, 0x00
]);
conversion_test({ x: "y" }, [
  0x07, 0x00, 0x02, 0x22,
  0x00, 0x23, 0x00
]);
conversion_test({ x: { y: 1 } }, [
  0x0b, 0x00, 0x03, 0x22,
  0x00, 0x06, 0x00, 0x05,
  0x23, 0x00, 0x01
]);
conversion_test({ x: [ 8 ] }, [
  0x09, 0x00, 0x04, 0x22,
  0x00, 0x04, 0x00, 0x05,
  0x08
]);
conversion_test({ name: 'wait' }, [
  0x07, 0x00, 0x02,
  0x0d, 0x00, 0x06, 0x00
]);

describe('translate wait', function() {
  const trans = bilbinary.translator({ name: 'wait', secs: 0.6 });

  it('should be wait in binary format', function() {
    assert.deepEqual(trans.translate(), new Buffer([
      0x0e, 0x00, 0x02, 0x0d, 0x00,
      0x06, 0x00, 0x01, 0x11, 0x00,
      0x9a, 0x99, 0x19, 0x3f
    ]));
  });
});

describe('translate function', function() {
  const trans = bilbinary.translator({
    'port-settings': {},
    scripts: [
      {
        name: 'function', function: 'f', blocks: [
          { name: 'wait', secs: 0.5 },
        ]
      },
      {
        name: 'when-green-flag-clicked', blocks: [
          { name: 'call-function', function: 'f' },
          { name: 'wait', secs: {
            name: 'plus', x: 200, y: -50 }
          }
        ]
      }
    ]});

  it('should be function in binary format', function() {
    assert.deepEqual(trans.translate(), new Buffer([
      96, 0,                    // length: 96 bytes

      // 'port-settings': {}
      3,                        // type: object
      32, 0,                    // keyword: 'port-settings'
      2, 0,                     // length: 2 bytes

      // scripts: [ ...
      4,                        // type: array
      33, 0,                    // keyword: 'scripts'
      86, 0,                    // length: 86 bytes

      // { name: 'function', ... }
      3,                        // type: object
      31, 0,                    // length: 31 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      42, 0,                    // insn: 'function'
      5,                        // type: int8
      10, 0,                    // keywrod: 'function'
      0,                        // int8: 0
      4,                        // type: array
      26, 0,                    // keyword: 'blocks'
      17, 0,                    // length: 17 bytes
      3,                        // type: object
      14, 0,                    // length: 14
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      6, 0,                     // insn: 'wait'
      1,                        // type: float
      17, 0,                    // keyword: 'secs'
      0, 0, 0, 63,              // float: 0.5

      // { name: 'when-green-flag-clicked', ... }
      3,                        // type: object
      51, 0,                    // length: 51 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      1, 0,                     // insn: 'when-green-flag-clicked'

      // blocks: [ ...
      4,                        // type: array
      26, 0,                    // keyword: 'blocks'
      41, 0,                    // length: 41 bytes

      // { name: 'call-function', ... }
      3,                        // type: object
      11, 0,                    // length: 11 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      43, 0,                    // insn: 'call-function'
      5,                        // type: int8
      10, 0,                    // keyword: 'function'
      0,                        // int8: 0

      // { name: 'wait', ... }
      3,                        // type: object
      26, 0,                    // length: 26 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      6, 0,                     // insn: 'wait'

      // secs: ...
      3,                        // type: object
      17, 0,                    // keyword: 'secs'
      16, 0,                    // length: 16 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      10, 0,                    // insn: 'plus'
      6,                        // type: int16
      34, 0,                    // keyword: 'x'
      200, 0,                   // int16: 200
      5,                        // type: int8
      35, 0,                    // keyword: 'y'
      206,                      // int8: -50
    ]));
  });
});
