function checked(func, predicate) {
  return function (...args) {
    if (predicate(...args)) {
      return func(...args);
    }
  };
}

function identity(x) {
  return x;
}

function nest_function(outer, inner, outer_args) {
  return function stored_function(...args) {
    if (inner === undefined)
    {
      return outer(...args, ...outer_args);
    }
    return outer(...inner(...args), ...outer_args);
  }
}

/* The functions `integer`, `element`, `collect`, `repeat`, `harvest`, `limit`,
 * `filter`, `concat`, and `join` are all taken directly, verbatum from the
 * book "How JavaScript Works" by Douglas Crockford. `map` is slightly
 * modified. */
function integer(from = 0, to = Number.MAX_SAFE_INTEGER, step = 1) {
  return function () {
    if (from < to) {
      const result = from;
      from += step;
      return result;
    }
  };
}

function element(array, gen = integer(0, array.length)) {
  return function element_generator(...args) {
    const element_nr = gen(...args);
    if (element_nr !== undefined) {
      return array[element_nr];
    }
  };
}

function collect(generator, array) {
  return function collect_generator(...args) {
    const value = generator(...args);
    if (value !== undefined) {
      array.push(value);
    }
    return value;
  };
}

function repeat(generator) {
  if (generator() !== undefined) {
    return repeat(generator);
  }
}

function harvest(generator) {
  const array = [];
  repeat(collect(generator, array));
  return array;
}

function limit(generator, count = 1) {
  return function (...args) {
    if (count >= 1) {
      count -= 1;
      return generator(...args);
    }
  };
}

function filter(generator, predicate) {
  return function filter_generator(...args) {
    const value = generator(...args);
    if (value !== undefined && !predicate(value)) {
      return filter_generator(...args);
    }
    return value;
  };
}

function concat(...generators) {
  const next = element(generators);
  let generator = next();
  return function concat_generator(...args) {
    if (generator !== undefined) {
      const value = generator(...args);
      if (value === undefined) {
        generator = next();
        return concat_generator(...args);
      }
      return value;
    }
  };
}

function join(func, ...generators) {
  return function join_generator() {
    return func(...generators.map(function (gen) {
      return gen();
    }));
  };
}

function join_single(func, generator) {
  return function join_generator() {
    const arg = generator();
    if (arg !== undefined) {
      return func(arg);
    }
  };
}

function map(array, func) {
  return harvest(join_single(func, element(array)));
}

module.exports = Object.freeze({
  checked, identity, integer, element, collect, repeat, harvest, limit,
  filter, concat, join, join_single, map});
