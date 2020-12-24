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

/* The functions `constant`, `integer`, `element`, `collect`, `repeat`,
 * `harvest`, `limit`, `filter`, `concat`, and `join` are all taken directly,
 * verbatum from the book "How JavaScript Works" (HJS) by Douglas Crockford.
 * `map` is slightly modified. */

/* In HJS, Crockford uses function closures to provide an alternative to native
 * JavaScript generators.  HJS factories are functions that return ("make")
 * generator functions.  Every time you call a generator function, it
 * emits/generates a new value based on the closure of the factory function.
 */

function constant(value) {
  return function constant_generator() {
    return value;
  };
}

/* Makes a generator that generates integer values from `from` to `to` in
 * `step` increments. */
function integer(from = 0, to = Number.MAX_SAFE_INTEGER, step = 1) {
  return function integer_generator() {
    if (from < to) {
      const result = from;
      from += step;
      return result;
    }
  };
}

/* Makes a generator that generates the elements of the array `array`.  `gen`
 * is a generator that generates the element numbers of `array` that the
 * primary generator should retrieve. */
function element(array, gen = integer(0, array.length)) {
  return function element_generator(...args) {
    const element_nr = gen(...args);
    if (element_nr !== undefined) {
      return array[element_nr];
    }
  };
}

/* Makes a generator that emulates `generator` but also adds the generated,
 * non-`undefined` elements to array `array`. */
function collect(generator, array) {
  return function collect_generator(...args) {
    const value = generator(...args);
    if (value !== undefined) {
      array.push(value);
    }
    return value;
  };
}

/* Calls the generator function `generator` until that function returns
 * `undefined`.
 *
 * With a modest amount of scaffolding, this can emulate `Array.forEach`,
 * `Array.every`, `Array.some`, `Array.find`, `Array.findIndex`,
 * `Array.filter`, and `Array.map` (for this last one, see `map` below).  It
 * can also build additional tools (Crockford mentions, for example, the
 * possibility of having a `map` function or method that can start at the
 * back of an array and work towards the front).
 */
function repeat(generator) {
  if (generator() !== undefined) {
    return repeat(generator);
  }
}

/* Uses `repeat` to call a generator until it is "exhausted", returning an
 * array of all the non-`undefined` results. */
function harvest(generator) {
  const array = [];
  repeat(collect(generator, array));
  return array;
}

/* Modifies the generator `generator` so that it will only return
 * non-`undefined` results at most `count` number of times. */
function limit(generator, count = 1) {
  return function (...args) {
    if (count >= 1) {
      count -= 1;
      return generator(...args);
    }
  };
}

/* Modifies the generator `generator` so that it will only return results for
 * which the function `predicate` returns truthy. */
function filter(generator, predicate) {
  return function filter_generator(...args) {
    const value = generator(...args);
    if (value !== undefined && !predicate(value)) {
      return filter_generator(...args);
    }
    return value;
  };
}

/* Makes a generator from the `generators` list of arguments such that the new
 * generator moves from each generator in the list to the next one when the
 * last one is "exhausted" (i.e. generates `undefined`). */
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

/* Makes a generator from the `generators` list of arguments such that when the
 * new generator is called (i.e. requested to generate a new value), it has all
 * of the argument generators generate a value, and then returns the value of
 * calling `func` with that list of values as its arguments. */
function join(func, ...generators) {
  return function join_generator() {
    return func(...generators.map(function (gen) {
      return gen();
    }));
  };
}

/* Makes a generator from the `generator` argument such that when the new
 * generator is called (i.e. requested to generate a new value), it obtains a
 * value from `generator` and, if that value is not `undefined`, returns the
 * result of calling `func` on that value. */
function premap(func, generator) {
  return function join_generator() {
    const arg = generator();
    if (arg !== undefined) {
      return func(arg);
    }
  };
}

/* Call `func` on each element of `array` and return a new array of the
 * results. */
function map(array, func) {
  return harvest(premap(func, element(array)));
}

module.exports = Object.freeze({
  checked, identity, constant, integer, element, collect, repeat, harvest,
  limit, filter, concat, join, premap, map});
