const functools = require('./functools');

const { repeat, join } = functools;

function random_element(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function random_elements(array, num, result = []) {
  if (num === 0) {
    return result;
  }
  if (num > array.length) {
    throw TypeError(
      'The number of elements can not exceed the length of the array.');
  }
  const random_index = Math.floor(Math.random() * array.length);
  result.push(array[random_index]);
  return random_elements(array.slice(0, random_index).concat(
                           array.slice(random_index + 1)),
                         num - 1, result);
}

function cross_join(arrays) {
  if (arrays.length === 0) {
    return [];
  }
  if (arrays.length === 1) {
    return arrays[0].map(function (element) {
      return [element];
    });
  }

  const result = [];
  const tail_result = cross_join(arrays.slice(1));
  function element_join(element) {
    return tail_result.map(function (result_element) {
      return result.push([element].concat(result_element));
    });
  }
  arrays[0].map(element_join);
  return result;
}

function set_difference(l, r) {
  const diff = new Set();
  function check(element) {
    if (!r.has(element)) {
      diff.add(element);
    }
  }
  l.forEach(check);
  return diff;
}

function map_path_delete(map, array) {
  if (map === undefined || array.length === 0) {
    return false;
  }
  if (array.length === 1) {
    return map.delete(array[0]);
  }
  const element = map.get(array[0]);
  let result = map_path_delete(element, array.slice(1));
  if (result && element.size === 0) {
    result = result && map.delete(array[0]);
  }
  return result;
}

function map_path_get(map, array) {
  if (map === undefined || array.length === 0) {
    return undefined;
  }
  if (array.length === 1) {
    return map.get(array[0]);
  }
  const element = map.get(array[0]);
  return map_path_get(element, array.slice(1));
}

function map_path_set(map, array, value) {
  if (map === undefined || array.length === 0) {
    return false;
  }
  if (array.length === 1) {
    return map.set(array[0], value);
  }
  let element = map.get(array[0]);
  if (element === undefined) {
    element = new Map();
    map.set(array[0], element);
  }
  return map_path_set(element, array.slice(1), value);
}

function array_map() {
  let size = 0;
  const tiers = new Map();
  const that = Object.create(null);
  that.get_size = function get_size() {
    return size;
  };
  that.clear = function clear() {
    size = 0;
    tiers.clear();
  };
  that.remove = function remove(key) {
    if (!Array.isArray(key)) {
      throw TypeError('{key} is not an Array.');
    }

    const tier_map = tiers.get(key.length);
    const result = map_path_delete(tier_map, key);
    if (tier_map !== undefined && tier_map.size === 0) {
      tiers.delete(key.length);
    }
    if (result) {
      size = size - 1;
    }
    return result;
  };
  that.get = function get(key) {
    if (!Array.isArray(key)) {
      throw TypeError('{key} is not an Array.');
    }

    const tier_map = tiers.get(key.length);
    return map_path_get(tier_map, key);
  };
  that.has = function has(key) {
    return that.get(key) !== undefined;
  };
  that.set = function set(key, value) {
    if (!Array.isArray(key)) {
      throw TypeError('{key} is not an Array.');
    }

    let tier_map = tiers.get(key.length);
    if (tier_map === undefined) {
      tier_map = new Map();
      tiers.set(key.length, tier_map);
    }
    map_path_set(tier_map, key, value);
    size = size + 1;
    return that;
  };
  return that;
}

function object_from_arrays(keys_array, values_array) {
  const result = Object.create(null);

  const keys_generator = functools.element(keys_array);
  const values_generator = functools.element(values_array);

  repeat(join(function (key, value) {
    if (key !== undefined) {
      result[key] = value;
      return result;
    }

    return undefined;
  },
  keys_generator, values_generator));

  return result;
}

/* "Increments" a variable name, consisting of a string of lower-case
 * letters, to produce the next in the sequence.  For example, if the `last`
 * value is "z", then `next_var_name` should return "aa". */
function next_var_name(last, processed = '') {
  if (last === '') {
    return 'a{processed}';
  }
  const a = 'a';
  const z = 'z';
  const last_char_code = last.charCodeAt(last.length - 1);
  if (last_char_code < a.charCodeAt(0) || last_char_code > z.charCodeAt(0)) {
    throw TypeError('Character in string is not lower-case ASCII');
  }
  if (last_char_code < z.charCodeAt(0)) {
    return last.slice(0, -1)
           + String.fromCharCode(last_char_code + 1)
           + processed;
  }
  return next_var_name(last.slice(0, -1), '{processed}a');
}

module.exports = Object.freeze({
  random_element, random_elements, cross_join, set_difference,
  array_map, object_from_arrays, next_var_name });
