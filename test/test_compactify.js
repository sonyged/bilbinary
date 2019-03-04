/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 *
 * Copyright (c) 2017 Sony Global Education, Inc.
 */

'use strict';

const rewire = require('rewire');
const assert = require('assert');

const { compactify, uncompactify } = require('../compactify.js');

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

describe('build_fvlmap', function() {
  it('should return fvlmap', function() {
    const compactify = rewire('../compactify.js');
    const build_fvlmap = compactify.__get__('build_fvlmap');

    assert.deepEqual(build_fvlmap([
    ]), { "args": {}, "function": {}, "list": {}, "variable": {} });

    assert.deepEqual(build_fvlmap([
      { name: 'function', function: 'f1', blocks: [] }
    ]), {
      "args": { 'f1': {} },
      "function": { 'f1': 0 },
      "list": {},
      "variable": {} });
    assert.deepEqual(build_fvlmap([
      { name: 'function', function: 'f1', blocks: [] },
      { name: 'function', function: 'f2', blocks: [] }
    ]), {
      "args": { 'f1': {}, 'f2': {} },
      "function": { 'f1': 0, 'f2': 1 },
      "list": {},
      "variable": {} });
    assert.deepEqual(build_fvlmap([
      { name: 'function',
        function: 'f1',
        args: [ { variable: 'p' }, { variable: 'q' } ],
        blocks: [] },
      { name: 'function',
        function: 'f2',
        args: [ { variable: 'x' }, { variable: 'y' } ],
        blocks: [] }
    ]), {
      "args": {
        "f1": { "p": -1, "q": -2 },
        "f2": { "x": -1, "y": -2 }
      },
      "function": { 'f1': 0, 'f2': 1 },
      "list": {},
      "variable": {} });
  });
});

describe('compacitify function', function() {
  it('should compacitify function arguments', function() {
    const compactify = rewire('../compactify.js');
    const compactify_args = compactify.__get__('compactify_args');

    assert.deepEqual(compactify_args({
    }, { "args": {}, "function": {}, "list": {}, "variable": {} }), {});

    assert.deepEqual(compactify_args(
      [
        { name: 'function',
          function: 'f1',
          args: [ { variable: 'p' }, { variable: 'q' } ],
          blocks: [
            { name: 'if-then',
              condition: {
                name: 'equal?',
                x: { name: 'variable-ref', variable: 'p' },
                y: 1 },
              blocks: [
                { name: 'plus',
                  x: { name: 'variable-ref', variable: 'p' },
                  y: { name: 'variable-ref', variable: 'q' } }]},
          ] },
        { name: 'function',
          function: 'f2',
          args: [ { variable: 'x' }, { variable: 'y' } ],
          blocks: [
            { name: 'if-then',
              condition: {
                name: 'equal?',
                x: { name: 'variable-ref', variable: 'p' },
                y: 1 },
              blocks: [
                { name: 'plus',
                  x: { name: 'variable-ref', variable: 'p' },
                  y: { name: 'variable-ref', variable: 'q' } }]},
          ] }
      ],
      {
        "args": {
          "f1": { "p": -1, "q": -2 },
          "f2": { "x": -1, "y": -2 }
        },
        "function": { 'f1': 0, 'f2': 1 },
        "list": {},
        "variable": { 'p': 0, 'q': 1, 'x': 2, 'y': 3 } }
    ), [
      { name: 'function',
        function: 'f1',
        args: 2,
        blocks: [
          { name: 'if-then',
            condition: {
              name: 'equal?',
              x: { name: 'variable-ref', variable: -1 },
              y: 1 },
            blocks: [
              { name: 'plus',
                x: { name: 'variable-ref', variable: -1 },
                y: { name: 'variable-ref', variable: -2 } }]}]},
      { name: 'function',
        function: 'f2',
        args: 2,
        blocks: [
          { name: 'if-then',
            condition: {
              name: 'equal?',
              x: { name: 'variable-ref', variable: 'p' },
              y: 1 },
            blocks: [
              { name: 'plus',
                x: { name: 'variable-ref', variable: 'p' },
                y: { name: 'variable-ref', variable: 'q' } }]},
        ] }]);
  });
});

describe('compacitify scripts', function() {
  it('should compacitify scripts', function() {
    const compactify = rewire('../compactify.js');
    const compactify_scripts = compactify.__get__('compactify_scripts');

    assert.deepEqual(compactify_scripts({
    }, { "args": {}, "function": {}, "list": {}, "variable": {} }), {});

    assert.deepEqual(compactify_scripts(
      [
        { name: 'function',
          function: 'f1',
          args: [ { variable: 'p' }, { variable: 'q' } ],
          blocks: [
            { name: 'if-then',
              condition: {
                name: 'equal?',
                x: { name: 'variable-ref', variable: 'p' },
                y: 1 },
              blocks: [
                { name: 'plus',
                  x: { name: 'variable-ref', variable: 'p' },
                  y: { name: 'variable-ref', variable: 'q' } }]},
          ] },
        { name: 'function',
          function: 'f2',
          args: [ { variable: 'x' }, { variable: 'y' } ],
          blocks: [
            { name: 'if-then',
              condition: {
                name: 'equal?',
                x: { name: 'variable-ref', variable: 'p' },
                y: { name: 'call-function',
                     function: 'f1',
                     args: [
                       { variable: 'p',
                         value: {
                           name: 'multiply',
                           x: { name: 'variable-ref', variable: 'y' },
                           y: { name: 'variable-ref', variable: 'x' } }},
                       { variable: 'q',
                         value: {
                           name: 'divide',
                           x: { name: 'variable-ref', variable: 'p' },
                           y: { name: 'variable-ref', variable: 'q' } }},
                     ], } },
              blocks: [
                { name: 'plus',
                  x: { name: 'variable-ref', variable: 'p' },
                  y: { name: 'variable-ref', variable: 'q' } }]},
          ] }
      ],
      {
        "args": {
          "f1": { "p": -1, "q": -2 },
          "f2": { "x": -1, "y": -2 }
        },
        "function": { 'f1': 0, 'f2': 1 },
        "list": {},
        "variable": { 'p': 0, 'q': 1, 'x': 2, 'y': 3 } }
    ), [
      { name: 'function',
        function: 0,
        args: 2,
        blocks: [
          { name: 'if-then',
            condition: {
              name: 'equal?',
              x: { name: 'variable-ref', variable: -1 },
              y: 1 },
            blocks: [
              { name: 'plus',
                x: { name: 'variable-ref', variable: -1 },
                y: { name: 'variable-ref', variable: -2 } }]}]},
      { name: 'function',
        function: 1,
        args: 2,
        blocks: [
          { name: 'if-then',
            condition: {
              name: 'equal?',
              x: { name: 'variable-ref', variable: 0 },
              y: { name: 'call-function', function: 0,
                   args: [
                     { variable: -1,
                       value: {
                         name: 'multiply',
                         x: { name: 'variable-ref', variable: -2 },
                         y: { name: 'variable-ref', variable: -1 } }},
                     { variable: -2,
                       value: {
                         name: 'divide',
                         x: { name: 'variable-ref', variable: 0 },
                         y: { name: 'variable-ref', variable: 1 } }},
                   ]} },
            blocks: [
              { name: 'plus',
                x: { name: 'variable-ref', variable: 0 },
                y: { name: 'variable-ref', variable: 1 } }]},
        ] }]);
  });
});
