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
      101, 0,                   // length: 101 bytes

      // 'port-settings': {}
      3,                        // type: object
      32, 0,                    // keyword: 'port-settings'
      2, 0,                     // length: 2 bytes

      // port-parameters: {}
      3,                        // type: object
      88, 0,                    // keyword: 'port-parameters'
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

describe('translate function with local variables', function() {
  const trans = bilbinary.translator({
    'port-settings': {},
    scripts: [
      {
        name: 'function',
        function: 'f',
        locals: [
          { variable: 'p', value: { name: 'plus', x: 1, y: 2 } },
          { variable: 'q', value: { name: 'minus', x: 1, y: 2 } } ],
        blocks: [
          { name: 'wait',
            secs: {
              name: 'divide',
              x: { name: 'variable-ref', variable: 'q' },
              y: { name: 'variable-ref', variable: 'p' } }},
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
      187, 0,                   // length: 187 bytes

      // 'port-settings': {}
      3,                        // type: object
      32, 0,                    // keyword: 'port-settings'
      2, 0,                     // length: 2 bytes

      // port-parameters: {}
      3,                        // type: object
      88, 0,                    // keyword: 'port-parameters'
      2, 0,                     // length: 2 bytes

      // scripts: [ ...
      4,                        // type: array
      33, 0,                    // keyword: 'scripts'
      172, 0,                   // length: 172 bytes

      // { name: 'function', ... }
      3,                        // type: object
      117, 0,                   // length: 117 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      42, 0,                    // insn: 'function'
      5,                        // type: int8
      10, 0,                    // keywrod: 'function'
      0,                        // int8: 0
      4,                        // type: array
      90, 0,                    // keyword: 'locals'
      52, 0,                    // length: 52 bytes
      3,                        // type: object
      24, 0,                    // length: 24 bytes
      5,                        // type: int8
      11, 0,                    // keyword: 'variable'
      255,                      // int8: -1
      3,                        // type: object
      19, 0,                    // keyword: 'value'
      15, 0,                    // length: 15 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      10, 0,                    // insn: 'plus'
      5,                        // type: int8
      34, 0,                    // keyword: 'x'
      1,                        // int8: 1
      5,                        // type: int8
      35, 0,                    // keyword: 'y'
      2,                        // int8: 2
      3,                        // type: object
      24, 0,                    // length: 24 bytes
      5,                        // type: int8
      11, 0,                    // keyword: 'variable'
      254,                      // int8: -2
      3,                        // type: object
      19, 0,                    // keyword: 'value'
      15, 0,                    // length: 15 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      11, 0,                    // insn: 'minus'
      5,                        // type: int8
      34, 0,                    // keyword: 'x'
      1,                        // int8: 1
      5,                        // type: int8
      35, 0,                    // keyword: 'y'
      2,                        // int8: 2

      4,                        // type: array
      26, 0,                    // keyword: 'blocks'
      48, 0,                    // length: 48 bytes
      3,                        // type: object
      45, 0,                    // length: 45 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      6, 0,                     // insn: 'wait'
      3,                        // type: object
      17, 0,                    // keyword: 'secs'
      35, 0,                    // length: 35 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      13, 0,                    // insn: 'divide'
      3,                        // type: object
      34, 0,                    // keyword: 'x'
      11, 0,                    // length: 11 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      45, 0,                    // insn: 'variable-ref'
      5,                        // type: int8
      11, 0,                    // keyword: 'variable'
      254,                      // int8: -2
      3,                        // type: object
      35, 0,                    // keyword: 'y'
      11, 0,                    // length: 11 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      45, 0,                    // insn: 'variable-ref'
      5,                        // type: int8
      11, 0,                    // keyword: 'variable'
      255,                      // int8: -1

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

describe('translate function with arguments', function() {
  const trans = bilbinary.translator({
    'port-settings': {},
    scripts: [
    { name: 'when-green-flag-clicked',
      blocks: [
        { name: 'wait', secs: {
          name: 'call-function', function: 'f0',
          args: [
            { variable: 'p',
              value: { name: 'multiply', x: 2, y: 3 }},
            { variable: 'q',
              value: { name: 'divide', x: 5, y: 2 }}
          ] }},
        { name: 'wait', secs: {
          name: 'call-function', function: 'f1',
          args: [
            { variable: 'y', value: 8 },
            { variable: 'x',
              value: {
                name: 'call-function', function: 'f0',
                args: [
                  { variable: 'p',
                    value: { name: 'multiply', x: 3, y: 4 }},
                  { variable: 'q',
                    value: { name: 'divide', x: 5, y: 6 }}
                ] }}
          ] }},
      ]
    },
    { name: 'function', function: 'f0',
      args: [ { variable: 'p' }, { variable: 'q' } ],
      blocks: [ { name: 'plus', x: 1, y: 2 } ] },
    { name: 'function', function: 'f1',
      args: [ { variable: 'x' }, { variable: 'y' } ],
      blocks: [ { name: 'minus', x: 1, y: 2 } ] },
  ]});

  it('should be function in binary format', function() {
    assert.deepEqual(trans.translate(), new Buffer([
      // begin 295 bytes
      39, 1,                    // length: 295 bytes

      // 'port-settings': {}
      3,                        // type: object
      32, 0,                    // keyword: 'port-settings'
      // - begin 2 bytes
      2, 0,                     // length: 2 bytes
      // - end 2 bytes

      // port-parameters: {}
      3,                        // type: object
      88, 0,                    // keyword: 'port-parameters'
      // - begin 2 bytes
      2, 0,                     // length: 2 bytes
      // - end 2 bytes

      // scripts: [ ...
      4,                        // type: array
      33, 0,                    // keyword: 'scripts'
      24, 1,                    // length: 280 bytes

      // { name: 'when-green-flag-clicked', ...
      3,                        // type: object
      // - begin 203 bytes
      203, 0,                   // length: 203 bytes

      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      1, 0,                     // insn: 'when-green-flag-clicked'

      // blocks: [ ...
      4,                        // type: array
      26, 0,                    // keyword: 'blocks'
      // -- begin 193 bytes
      193, 0,                   // length: 193 bytes

      // { name: 'wait', ... }
      3,                        // type: object
      // --- begin 76 bytes
      76, 0,                    // length: 76 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      6, 0,                     // insn: 'wait'

      3,                        // type: object
      17, 0,                    // keyword: 'secs'
      // ---- begin 66 bytes
      66, 0,                    // length: 66 bytes

      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      43, 0,                    // insn: 'call-function'

      5,                        // type: int8
      10, 0,                    // keywrod: 'function'
      0,                        // int8: 0

      4,                        // type: array
      89, 0,                    // keyword: 'args'
      // ----- begin 52 bytes
      52, 0,                    // length: 52 bytes

      3,                        // type: object
      // ------ begin 24 bytes
      24, 0,                    // length: 24

      5,                        // type: int8
      11, 0,                    // keyword: 'variable'
      255,                      // -----1

      3,                        // type: object
      19, 0,                    // keyword: 'value'
      // ------- begin 15 bytes
      15, 0,                    // length: 15 bytes

      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      12, 0,                    // insn: 'multiply'

      5,                        // type: int8
      34, 0,                    // keyword: 'x'
      2,                        // int8: 2

      5,                        // type: int8
      35, 0,                    // keyword: 'y'
      3,                        // int8: 3
      // ------- end 15 bytes
      // ------ end 24 bytes

      3,                        // type: object
      // ------ begin 24 bytes
      24, 0,                    // length: 24 bytes
      5,                        // type: int8
      11, 0,                    // keyword: 'variable'
      254,                      // int8: -2

      3,                        // type: object
      19, 0,                    // keyword: 'value'
      // ------- begin 15 bytes
      15, 0,                    // length: 15 bytes

      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      13, 0,                    // insn: 'divide'

      5,                        // type: int8
      34, 0,                    // keyword: 'x'
      5,                        // int8: 5

      5,                        // type: int8
      35, 0,                    // keyword: 'y'
      2,                        // int8: 2
      // ------- end 15 bytes
      // ------ end 24 bytes
      // ----- end 52 bytes
      // ---- end 66 bytes
      // --- end 76 bytes

      // { name: 'wait', ...
      3,                        // type: object
      113, 0,                   // length: 113 bytes
      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      6, 0,                     // insn: 'wait'

      3,                        // type: object
      17, 0,                    // keyword: 'secs'
      // --- begin 103 bytes
      103, 0,                   // length: 103 bytes

      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      43, 0,                    // insn: 'call-function'
      5,                        // type: int8
      10, 0,                    // keyword: 'function'
      1,                        // int8: 1

      // args: [ ...
      4,                        // type: array
      89, 0,                    // keyword: 'args'
      // ---- begin 89 bytes
      89, 0,                    // length: 89 bytes

      // { variable: -2, value: 8 }
      3,                        // type: object
      // ----- begin 10 bytes
      10, 0,                    // length: 10 bytes

      5,                        // type: int8
      11, 0,                    // keyword: 'variable'
      254,                      // int8: -2
      5,                        // type: int8
      19, 0,                    // keyword: 'value'
      8,                        // int8: 8
      // ----- end 10 bytes

      // { variable: -1, value: 8 }
      3,                        // type: object
      // ----- begin 75 bytes
      75, 0,                    // length: 75 bytes
      5,                        // type: int8
      11, 0,                    // keyword: 'variable'
      255,                      // int: -1

      3,                        // type: object
      19, 0,                    // keyword: 'value'
      // ------ begin 66 bytes
      66, 0,                    // length: 66 bytes

      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      43, 0,                    // insn: 'call-function'
      5,                        // type: int8
      10, 0,                    // keyword: 'function'
      0,                        // int8: 0

      // { args: ...
      4,                        // type: array
      89, 0,                    // keyword: 'args'
      // ------- begin 52 bytes
      52, 0,                    // length: 52 bytes

      3,                        // type: object
      // -------- begin 24 bytes
      24, 0,                    // length: 24 bytes

      5,                        // type: int8
      11, 0,                    // keyword: 'variable'
      255,                      // int8: -1

      3,                        // type: object
      19, 0,                    // keyword: 'value'
      // --------- begin 15 bytes
      15, 0,                    // length: 15 bytes

      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      12, 0,                    // insn: 'multiply'
      5,                        // type: int8
      34, 0,                    // keyword: 'x'
      3,                        // int8: 3
      5,                        // type: int8
      35, 0,                    // keyword: 'y'
      4,                        // int8: 4
      // --------- end 15 bytes
      // -------- end 24 bytes

      3,                        // type: object
      // -------- begin 24 bytes
      24, 0,                    // length: 24 bytes

      5,                        // type: int8
      11, 0,                    // keyword: 'variable'
      254,                      // int8: -2

      3,                        // type: object
      19, 0,                    // keyword: 'value'
      // --------- begin 15 bytes
      15, 0,                    // length: 15 bytes

      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      13, 0,                    // insn: 'divide'
      5,                        // type: int8
      34, 0,                    // keyword: 'x'
      5,                        // int8: 5
      5,                        // type: int8
      35, 0,                    // keyword: 'y'
      6,                        // int8: 6
      // --------- end 15 bytes
      // -------- end 24 bytes
      // ------- end 52 bytes
      // ------ end 66 bytes
      // ----- end 75 bytes
      // ---- end 89 bytes
      // --- end 103 bytes
      // -- end 193 bytes
      // - end 203 bytes

      3,                        // type: object
      // - begin 36 bytes
      36, 0,                    // length: 36 bytes

      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      42, 0,                    // insn: 'function'

      5,                        // type: int8
      10, 0,                    // keyword: 'function'
      0,                        // int8: 0

      5,                        // type: int8
      89, 0,                    // keyword: 'args'
      2,                        // int8: 2

      4,                        // type: array
      26, 0,                    // keyword: 'blocks'
      // -- begin 18 bytes
      18, 0,                    // length: 18 bytes

      3,                        // type: object
      // --- begin 15 bytes
      15, 0,                    // length: 15 bytes

      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      10, 0,                    // insn: 'plus'
      5,                        // type: int8
      34, 0,                    // keyword: 'x'
      1,                        // int8: 1
      5,                        // type: int8
      35, 0,                    // keyword: 'y'
      2,                        // int8: 2
      // --- end 15 bytes
      // -- end 18 bytes
      // - end 36 bytes

      3,                        // type: object
      // - begin 36 bytes
      36, 0,                    // length: 36 bytes

      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      42, 0,                    // insn: 'function'

      5,                        // type: int8
      10, 0,                    // keyword: 'function'
      1,                        // int8: 1

      5,                        // type: int8
      89, 0,                    // keyword: 'args'
      2,                        // int8: 2

      4,                        // type: array
      26, 0,                    // keyword: 'blocks'
      // -- begin 18 bytes
      18, 0,                    // length: 18 bytes

      3,                        // type: object
      // --- begin 15 bytes
      15, 0,                    // length: 15 bytes

      2,                        // type: keyword
      13, 0,                    // keyword: 'name'
      11, 0,                    // insn: 'minus'
      5,                        // type: int8
      34, 0,                    // keyword: 'x'
      1,                        // int8: 1
      5,                        // type: int8
      35, 0,                    // keyword: 'y'
      2,                        // int8: 2
      // --- end 15 bytes
      // -- end 18 bytes
      // - end 36 bytes
      // end 295 bytes
    ]));
  });
});

describe('translate no port-parameters', function() {
  const trans = bilbinary.translator({
    'port-settings': {},
    scripts: []});

  it('should translate no port-parameters', function() {
    assert.deepEqual(trans.translate(), new Buffer([
      17, 0,                    // length: 17 bytes

      // 'port-settings': {}
      3,                        // type: object
      32, 0,                    // keyword: 'port-settings'
      2, 0,                     // length: 2 bytes

      // 'port-parameters': {}
      3,                        // type: object
      88, 0,                    // keyword: 'port-parameters'
      2, 0,                     // length: 2 bytes

      // scripts: [ ...
      4,                        // type: array
      33, 0,                    // keyword: 'scripts'
      2, 0,                     // length: 2 bytes
    ]));
  });
});

describe('translate empty port-parameters', function() {
  const trans = bilbinary.translator({
    'port-settings': { V0: 'dc-motor' },
    'port-parameters': {},
    scripts: []});

  it('should translate empty port-parameters', function() {
    assert.deepEqual(trans.translate(), new Buffer([
      22, 0,                    // length: 22 bytes

      // 'port-settings': {}
      3,                        // type: object
      32, 0,                    // keyword: 'port-settings'
      7, 0,                     // length: 7 bytes

      2,                        // type: keyword
      46, 0,                    // keyword: V0
      72, 0,                    // keyword: dc-motor

      // 'port-parameters': {}
      3,                        // type: object
      88, 0,                    // keyword: 'port-parameters'
      2, 0,                     // length: 2 bytes

      // scripts: [ ...
      4,                        // type: array
      33, 0,                    // keyword: 'scripts'
      2, 0,                     // length: 2 bytes
    ]));
  });
});

describe('translate nonexistent port-parameters', function() {
  const trans = bilbinary.translator({
    'port-settings': { V0: 'dc-motor' },
    'port-parameters': {
      V2: { 'servo-motor': { drift: -3.0 } }
    },
    scripts: []});

  it('should translate nonexistent port-parameters', function() {
    assert.deepEqual(trans.translate(), new Buffer([
      22, 0,                    // length: 22 bytes

      // 'port-settings': {}
      3,                        // type: object
      32, 0,                    // keyword: 'port-settings'
      7, 0,                     // length: 7 bytes

      2,                        // type: keyword
      46, 0,                    // keyword: V0
      72, 0,                    // keyword: dc-motor

      // 'port-parameters': {}
      3,                        // type: object
      88, 0,                    // keyword: 'port-parameters'
      2, 0,                     // length: 2 bytes

      // scripts: [ ...
      4,                        // type: array
      33, 0,                    // keyword: 'scripts'
      2, 0,                     // length: 2 bytes
    ]));
  });
});

describe('translate existent port-parameters', function() {
  const trans = bilbinary.translator({
    'port-settings': {
      V0: 'dc-motor',
      V6: 'servo-motor'
    },
    'port-parameters': {
      V0: { 'dc-motor': { scale: 0.8 } },
      V2: { 'servo-motor': { drift: 3.0 } },
      V6: {
        'servo-motor': { drift: -3.0 },
        'buzzer': { drift: -9.0 }
      }
    },
    scripts: []});

  it('should translate nonexistent port-parameters', function() {
    assert.deepEqual(trans.translate(), new Buffer([
      48, 0,                    // length: 48 bytes

      // 'port-settings': {}
      3,                        // type: object
      32, 0,                    // keyword: 'port-settings'
      12, 0,                    // length: 12 bytes

      2,                        // type: keyword
      46, 0,                    // keyword: V0
      72, 0,                    // keyword: dc-motor

      2,                        // type: keyword
      52, 0,                    // keyword: V6
      73, 0,                    // keyword: servo-motor

      // 'port-parameters': {}
      3,                        // type: object
      88, 0,                    // keyword: 'port-parameters'
      23, 0,                    // length: 2 bytes

      3,                        // type: object
      46, 0,                    // keyword: V0
      9, 0,                     // length: 9 bytes
      1,                        // type: number
      86, 0,                    // keyword: scale
      205, 204, 76, 63,         // float: 0.800000011920929

      3,                        // type: object
      52, 0,                    // keyword: V6
      6, 0,                     // length: 6 bytes
      5,                        // type: int8
      87, 0,                    // keyword: drift
      253,                      // int8: -3

      // scripts: [ ...
      4,                        // type: array
      33, 0,                    // keyword: 'scripts'
      2, 0,                     // length: 2 bytes
    ]));
  });
});
