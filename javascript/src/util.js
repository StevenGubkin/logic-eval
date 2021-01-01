const functools = require('./functools');

const { repeat, join } = functools;

/* function dl_node() {
  let value;
  let previous;
  let next;
  let list;

  const that = Object.create(null);

  that.
  return that;
}

function dl_list() {
  let head;
  let tail;
  let size = 0;
  const that = Object.create(null);

  function dl_node(value) {
    let previous;
    let next;
    const list = that;
    const node = Object.create(null);

    node.insert_after = function insert_after(val) {
      new_node = dl_node(val);
      new_node.previous = node;
      if (node.next === undefined) {
        that.tail = new_node;
      } else {
        new_node.next = node.next;
        node.next.previous =
    }

  that.append = function append(value) {
  }
} */

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

function map_path_validate_element(element) {
  if (!Number.isFinite(element) && typeof element !== 'string') {
    throw TypeError(
      'Elements of `array_map` keys must be strings or finite numbers.');
  }
}

function map_path_delete(map, array) {
  if (map === undefined || array.length === 0) {
    return false;
  }
  map_path_validate_element(array[0]);
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
  map_path_validate_element(array[0]);
  if (array.length === 1) {
    return map.get(array[0]);
  }
  const element = map.get(array[0]);
  return map_path_get(element, array.slice(1));
}

function map_path_set(map, array, value) {
  if (map === undefined || array.length === 0) {
    return map;
  }
  map_path_validate_element(array[0]);
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
  const tiers = new Map();
  // reverse map, used for ordering:
  const insertion_ordering = new Map();
  const that = Object.create(null);
  that.get_size = function get_size() {
    return insertion_ordering.size;
  };
  that.clear = function clear() {
    insertion_ordering.clear();
    tiers.clear();
  };
  function get_wrapped(key) {
    if (!Array.isArray(key)) {
      throw TypeError('{key} is not an Array.');
    }

    const tier_map = tiers.get(key.length);
    return map_path_get(tier_map, key);
  }
  that.get = function get(key) {
    const result = get_wrapped(key);
    return result !== undefined ? result.value : undefined;
  };
  that.remove = function remove(key) {
    if (!Array.isArray(key)) {
      throw TypeError('{key} is not an Array.');
    }

    const value = get_wrapped(key);
    if (value !== undefined) {
      insertion_ordering.delete(value);

      const tier_map = tiers.get(key.length);
      map_path_delete(tier_map, key);
      if (tier_map !== undefined && tier_map.size === 0) {
        tiers.delete(key.length);
      }
    }
    return value !== undefined;
  };
  that.has = function has(key) {
    return that.get(key) !== undefined;
  };
  that.set = function set(key, value) {
    if (!Array.isArray(key)) {
      throw TypeError('{key} is not an Array.');
    }
    const old_value = that.get(key);
    if (old_value !== undefined) {
      insertion_ordering.delete(old_value);
    }
    const wrapped_value = Object.create(null);
    wrapped_value.value = value;
    insertion_ordering.set(wrapped_value, key);

    let tier_map = tiers.get(key.length);
    if (tier_map === undefined) {
      tier_map = new Map();
      tiers.set(key.length, tier_map);
    }
    map_path_set(tier_map, key, wrapped_value);
    return that;
  };
  that.to_array = function to_array() {
    return Array.from(insertion_ordering.entries()).map(function (entry) {
      return [entry[1], entry[0].value];
    });
  };
  that.from_array = function from_array(array) {
    let index = 0;
    return function set_next() {
      if (index === array.length) {
        return that;
      }
      that.set(array[index][0], array[index][1]);
      index = index + 1;
      return set_next();
    }();
  };
  that.clone = function clone() {
    const as_array = that.to_array();
    const am = array_map();
    return am.from_array(as_array);
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
