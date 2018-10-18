/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 *
 * Copyright (c) 2017 Sony Global Education, Inc.
 */

'use strict';
const { compactify, uncompactify } = require('../compactify.js'),
      assert = require('assert');

describe('compactify empty array', function() {
  const cbil = compactify([]);

  it('should be empty array', function() {
    assert.deepEqual(cbil, []);
  });
});

describe('compactify immediate', function() {
  it('should return number if number is given', function() {
    const cbil = compactify(3.14);
    assert.deepEqual(cbil, 3.14);
  });
  it('should return string if string is given', function() {
    const cbil = compactify('3.14');
    assert.deepEqual(cbil, '3.14');
  });
});
