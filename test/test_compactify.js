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
    ]), { "locals": {}, "function": {}, "list": {}, "variable": {} });

    assert.deepEqual(build_fvlmap([
      { name: 'function', function: 'f1', blocks: [] }
    ]), {
      "locals": { 'f1': {} },
      "function": { 'f1': 0 },
      "list": {},
      "variable": {} });

    assert.deepEqual(build_fvlmap([
      { name: 'function', function: 'f1', blocks: [] },
      { name: 'function', function: 'f2', blocks: [] }
    ]), {
      "locals": { 'f1': {}, 'f2': {} },
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
      "locals": {
        "f1": { "p": -1, "q": -2 },
        "f2": { "x": -1, "y": -2 }
      },
      "function": { 'f1': 0, 'f2': 1 },
      "list": {},
      "variable": {} });

    assert.deepEqual(build_fvlmap([
      { name: 'function',
        function: 'f1',
        locals: [ { variable: 'p', value: 0 }, { variable: 'q', value: 1 } ],
        blocks: [] },
      { name: 'function',
        function: 'f2',
        args: [ { variable: 'x' }, { variable: 'y' } ],
        blocks: [] }
    ]), {
      "locals": {
        'f1': { "p": -1, "q": -2 },
        'f2': { "x": -1, "y": -2 } },
      "function": { 'f1': 0, 'f2': 1 },
      "list": {},
      "variable": {} });

    assert.deepEqual(build_fvlmap([
      { name: 'function',
        function: 'f1',
        args: [ { variable: 'x' }, { variable: 'y' } ],
        locals: [ { variable: 'p', value: 0 }, { variable: 'q', value: 1 } ],
        blocks: [] },
      { name: 'function',
        function: 'f2',
        args: [ { variable: 'x' }, { variable: 'y' } ],
        locals: [ { variable: 'u', value: 2 }, { variable: 'v', value: 3 } ],
        blocks: [] }
    ]), {
      "locals": {
        'f1': { "x": -1, "y": -2, "p": -3, "q": -4 },
        'f2': { "x": -1, "y": -2, "u": -3, "v": -4 } },
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
    }, {
      "locals": {}, "function": {}, "list": {}, "variable": {}
    }), {});

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
        "locals": {
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

  it('should compacitify function with local variables', function() {
    const compactify = rewire('../compactify.js');
    const compactify_args = compactify.__get__('compactify_args');

    assert.deepEqual(compactify_args(
      [
        { name: 'function',
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
          ] }],
      { "locals": { "f": { "p": -1, "q": -2 } },
        "function": { 'f': 0 },
        "list": {},
        "variable": { 'p': 0, 'q': 1, 'x': 2, 'y': 3 } }
    ), [
      { name: 'function',
        function: 'f',
        locals: [
          { variable: -1, value: { name: 'plus', x: 1, y: 2 } },
          { variable: -2, value: { name: 'minus', x: 1, y: 2 } } ],
        blocks: [
          { name: 'wait',
            secs: {
              name: 'divide',
              x: { name: 'variable-ref', variable: -2 },
              y: { name: 'variable-ref', variable: -1 } }},
        ] }]);

    assert.deepEqual(compactify_args(
      [
        { name: 'function',
          function: 'f1',
          locals: [
            { variable: 'p', value: { name: 'plus', x: 1, y: 2 } },
            { variable: 'q', value: { name: 'minus', x: 1, y: 2 } } ],
          blocks: [
            { name: 'wait',
              secs: {
                name: 'divide',
                x: { name: 'variable-ref', variable: 'q' },
                y: { name: 'variable-ref', variable: 'p' } }},
          ] },
        { name: 'function',
          function: 'f2',
          args: [
            { variable: 'q' }
          ],
          locals: [
            { variable: 'p', value: { name: 'plus', x: 1, y: 2 } },
            { variable: 'r', value: {
              name: 'minus',
              x: { name: 'variable-ref', variable: 'q' },
              y: 2 } } ],
          blocks: [
            { name: 'wait',
              secs: {
                name: 'divide',
                x: { name: 'variable-ref', variable: 'r' },
                y: { name: 'variable-ref', variable: 'q' } }},
          ] }],
      {
        "locals": {
          "f1": { "p": -1, "q": -2 },
          "f2": { "q": -1, "p": -2, "r": -3 }
        },
        "function": { 'f1': 0 },
        "list": {},
        "variable": { 'p': 0, 'q': 1, 'x': 2, 'y': 3 } }
    ), [
      { name: 'function',
        function: 'f1',
        locals: [
          { variable: -1, value: { name: 'plus', x: 1, y: 2 } },
          { variable: -2, value: { name: 'minus', x: 1, y: 2 } } ],
        blocks: [
          { name: 'wait',
            secs: {
              name: 'divide',
              x: { name: 'variable-ref', variable: -2 },
              y: { name: 'variable-ref', variable: -1 } }},
        ] },
      { name: 'function',
        function: 'f2',
        args: 1,
        locals: [
          { variable: -2, value: { name: 'plus', x: 1, y: 2 } },
          { variable: -3, value: {
            name: 'minus',
            x: { name: 'variable-ref', variable: -1 },
            y: 2 } } ],
        blocks: [
          { name: 'wait',
            secs: {
              name: 'divide',
              x: { name: 'variable-ref', variable: -3 },
              y: { name: 'variable-ref', variable: -1 } }},
        ] }]);
  });
});

describe('compacitify scripts', function() {
  it('should compacitify scripts', function() {
    const compactify = rewire('../compactify.js');
    const compactify_scripts = compactify.__get__('compactify_scripts');
    const compactify_toplevel = compactify.__get__('compactify_toplevel');

    assert.deepEqual(compactify_scripts({
    }, { "locals": {}, "function": {}, "list": {}, "variable": {} }), {});

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
        "locals": {
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

    assert.deepEqual(compactify_toplevel({
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
                { variable: 'y',
                  value: 8},
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
      ]}), {
        "port-parameters": {},
        "port-settings": {},
        "scripts": [
          {
            "blocks": [
              {
                "name": "wait",
                "secs": {
                  "args": [
                    {
                      "value": {
                        "name": "multiply",
                        "x": 2,
                        "y": 3,
                      },
                      "variable": -1
                    },
                    {
                      "value": {
                        "name": "divide",
                        "x": 5,
                        "y": 2,
                      },
                      "variable": -2
                    }
                  ],
                  "function": 0,
                  "name": "call-function"
                }
              },
              {
                "name": "wait",
                "secs": {
                  "args": [
                    {
                      "value": 8,
                      "variable": -2
                    },
                    {
                      "value": {
                        "args": [
                          {
                            "value": {
                              "name": "multiply",
                              "x": 3,
                              "y": 4
                            },
                            "variable": -1
                          },
                          {
                            "value": {
                              "name": "divide",
                              "x": 5,
                              "y": 6
                            },
                            "variable": -2
                          }
                        ],
                        "function": 0,
                        "name": "call-function"
                      },
                      "variable": -1
                    }
                  ],
                  "function": 1,
                  "name": "call-function"
                }
              }
            ],
            "name": "when-green-flag-clicked"
          },
          {
            "args": 2,
            "blocks": [
              {
                "name": "plus",
                "x": 1,
                "y": 2
              }
            ],
            "function": 0,
            "name": "function"
          },
          {
            "args": 2,
            "blocks": [
              {
                "name": "minus",
                "x": 1,
                "y": 2
              }
            ],
            "function": 1,
            "name": "function"
          }
        ]
      });
  });
});
