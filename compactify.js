/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 *
 * Copyright (c) 2017 Sony Global Education, Inc.
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';
const debug = require('debug')('compactify');

const immediate_p = (x) => ['string', 'number', 'boolean'].includes(typeof x);

/*
 * List of blocks consists for environment.
 */
const environ_p = (x) => ['function', 'variable', 'list', 'image'].includes(x);

/*
 * List of blocks which access to environment.
 */
const environ_accessor_p = (blk) => [
  'call-function',

  'variable-ref',
  'set-variable-to',
  'change-variable-by',

  'list-length',
  'list-add',
  'list-contains?',
  'list-ref',
  'list-delete',
  'list-replace',
  'list-insert',

  'led-matrix',
].includes(blk.name);

const variable_accessor_p = blk => [
  'variable-ref',
  'set-variable-to',
  'change-variable-by',
].includes(blk.name);

const string_key_p = (key) => [
  'name',
  'port',
  'mode',
  'direction',
].includes(key);

const compactify_args = (obj, fvlmap) => {
  if (obj instanceof Array)
    return obj.map(x => compactify_args(x, fvlmap));
  if (immediate_p(obj))
    return obj;
  const resolve_locals = (locals, tag) => {
    const map = locals[tag];
    return Object.keys(obj).reduce((acc, x) => {
      const replace_variable = x => (obj[x] || []).map(arg => {
        return Object.keys(arg).reduce((acc, x) => {
          acc[x] = arg[x];
          if (x === 'variable')
            acc[x] = map[arg[x]];
          return acc;
        }, {});
      });
      acc[x] = obj[x];
      if (x === 'args') {
        if (true)
          acc[x] = (obj[x] || []).length;
        else 
          acc[x] = replace_variable(x);
      }
      const rec = (obj) => {
        if (obj instanceof Array)
          return obj.map(x => rec(x));
        if (immediate_p(obj))
          return obj;
        return Object.keys(obj).reduce((acc, key) => {
          const v = obj[key];
          if (variable_accessor_p(obj) &&
              key === 'variable' &&
              typeof v === 'string' &&
              typeof map[v] === 'number') {
            acc[key] = map[v];
          } else {
            acc[key] = rec(v);
          }
          return acc;
        }, {});
      };
      if (x === 'locals')
        acc[x] = rec(replace_variable(x));
      if (x === 'blocks') {
        acc[x] = rec(obj[x]);
      }
      return acc;
    }, {});
  };
  if (obj instanceof Object) {
    if (obj.name === 'function')
      return resolve_locals(fvlmap.locals, obj.function);
    if (obj.name === 'when-green-flag-clicked')
      return resolve_locals(fvlmap[obj.name], 'locals');
  }
  return obj;
};

const compactify = (obj, fvlmap) => {
  if (obj instanceof Array)
    return obj.map(x => compactify(x, fvlmap));
  if (immediate_p(obj))
    return obj;
  return Object.keys(obj).reduce((acc, key) => {
    const v = obj[key];
    if (obj.name === 'call-function' && key === 'args') {
      const map = fvlmap.locals[obj.function];
      acc[key] = v.map(x => {
        return Object.keys(x).reduce((acc, key) => {
          if (key === 'variable') {
            acc[key] = map[x[key]];
          } else {
            acc[key] = compactify(x[key], fvlmap);
          }
          return acc;
        }, {});
      });
    } else if ((environ_p(obj.name) || environ_accessor_p(obj)) &&
        environ_p(key) &&
        typeof v === 'string') {
      if (typeof fvlmap[key][v] !== 'number')
        throw new Error(`Unknown ${key}: ${v}`);
      acc[key] = fvlmap[key][v];
    } else {
      acc[key] = compactify(v, fvlmap);
    }
    return acc;
  }, {});
};

const compactify_port_parameters = (port_parameters, port_settings) => {
  return Object.keys(port_settings).reduce((acc, port) => {
    /*
     * Convert from:
     *  "port-settings": { "V1": "servo-motor" }, ...
     *  "port-parameters": {
     *    "V1": {
     *      "servo-motor": {
     *        "param1": ...
     *      },
     *      "dc-motor": {
     *        "param2": ...
     *      }
     *    }
     *  }
     * ... to:
     *  "port-parameters": {
     *    "V1": {
     *      "param1": ...
     *    }
     *  }
     */
    if (port_parameters[port] &&
        port_parameters[port][port_settings[port]] &&
        typeof port_parameters[port][port_settings[port]] === 'object')
      acc[port] = port_parameters[port][port_settings[port]];
    return acc;
  }, {});
};

const build_fvlmap = (scripts) => {
  const idx = { locals: 0, function: 0, variable: 0, list: 0, image: 0 };
  return scripts.reduce((acc, x) => {
    if (environ_p(x.name))
      acc[x.name][x[x.name]] = idx[x.name]++;
    const map_locals = (locals, tag, keys) => {
      /*
       * The 'args' and 'locals' shares index value and it is local to
       * function.
       */
      idx.locals = -1;
      keys.forEach(key => {
        locals[tag] = (x[key] || []).reduce((acc, a) => {
          if (acc[a.variable])
            throw new Error(`${key} "${a.variable}" is already defined`);
          acc[a.variable] = idx.locals--;
          return acc;
        }, locals[tag] || {});
      });
    };
    if (x.name === 'function')
      map_locals(acc.locals, x[x.name], [ 'args', 'locals' ]);
    if (x.name === 'when-green-flag-clicked')
      map_locals(acc[x.name], 'locals', [ 'locals' ]);
    return acc;
  }, {
    'when-green-flag-clicked': {},
    locals: {},
    function: {},
    variable: {},
    list: {},
    image: {} })
};

const remove_python_info = (obj) => {
  if (obj instanceof Array)
    return obj.map(x => remove_python_info(x));
  if (immediate_p(obj))
    return obj;
  delete obj['python-info'];
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = remove_python_info(obj[key]);
    return acc;
  }, {});
};

const compactify_scripts = (scripts, fvlmap) => {
  scripts = remove_python_info(scripts);
  scripts = compactify_args(scripts, fvlmap);
  return compactify(scripts, fvlmap);
};

const compactify_toplevel = (script) => {
  if (!script.scripts)
    return compactify_scripts(script, {
      locals: {}, function: {}, variable: {}, list: {} });

  // exclude 'fragment', etc.
  const scripts = script.scripts.filter(x => [
    'when-green-flag-clicked',
    'function',
    'variable',
    'list',
    'image',
  ].includes(x.name));
  const pss = script['port-settings'] || {};
  const pps = script['port-parameters'] || {};
  return {
    'port-settings': pss,
    'port-parameters': compactify_port_parameters(pps, pss),
    scripts: compactify_scripts(scripts, build_fvlmap(scripts))
  };
};

const uncompactify = (script) => {};
const uncompactify_toplevel = (script) => {
  const scripts = script.scripts;
  if (!scripts)
    return uncompactify(script);
  return {
    'port-settings': script['port-settings'] || {},
    script: uncompactify(scripts)
  };
};

module.exports = {
  compactify: (script) => compactify_toplevel(script),
  uncompactify: (script) => uncompactify_toplevel(script)
};
