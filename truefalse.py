#This program will generate latex code for random wff involving $T$,
#$F$, $\wedge$ (and), $\vee$ (or), $\neg$ (not), $\implies$ , and
#$\Leftrightarrow$. It will also keep track of whether that wff is true
#or false so I can ask a student that question. I will think of a wff as
#an array of [tex,truth value].  For instance, [T \implies F, 0] would
#be a valid wff.  I will build these recursively.
import random
from pprint import pprint

class Node:
   def __init__(self):
      self.arguments = []

   def _getdepth(self):
      depth = 1
      for a in self.arguments:
         argdepth = a._getdepth()
         #print(a, 'depth:', argdepth)
         if argdepth + 1 > depth:
            depth = argdepth + 1

      return depth

   def _explain(self, s, binding=None, explain=False, doindent=False,
                stopdepth=0, _indentlevel=0):
      if self._getdepth() <= stopdepth:
         return str(self.getvalue(binding))
      else:
         if explain:
            display = ''
            if doindent:
               display = display + '\n' + ' ' * _indentlevel
            display = display + s
            if doindent:
               display = (display + ' % value: ' +
                          str(self.getvalue(binding)) + '\n')
            else:
               display = (display + ' [value: ' +
                          str(self.getvalue(binding)) + ']')
            return display
         else:
            return s

   def _apply_all_results(self, arguments_lists, single_argument=tuple()):
      pass

   def stepbystep(self, _depth=None):
      if _depth is None:
         _depth = self._getdepth()
      currentdepth = 1
      while currentdepth <= _depth:
         print(self.display(stopdepth = currentdepth) + '\n')
         currentdepth = currentdepth + 1

class Value(Node):
   def __init__(self, value):
      self.arguments = []
      self._value = value

   def display(self, binding=None, explain=False, doindent=False,
               stopdepth=0, _indentlevel=0):
      return [str(self._value)]

   def getvalue(self, binding=None):
      return self._value

class Wedge(Node):
   def __init__(self, arguments):
      # Check number of arguments?
      self.arguments = arguments

   def display(self, binding=None, explain=False, doindent=False,
               stopdepth=0, _indentlevel=0):
      left_results = self.arguments[0].display(
         binding, explain, doindent, stopdepth, _indentlevel + 1) +
      right_results = self.arguments[1].display(
         binding, explain, doindent, stopdepth, _indentlevel + 1) +
      results = []
      for left_result in left_results:
         for right_result in right_results:
            results.append(self._explain(
               '(' + left_result +
               ' \\wedge ' + right_result +
               ')', binding=binding, explain=explain, doindent=doindent,
                   stopdepth=stopdepth, _indentlevel=_indentlevel))
      return results

   def getvalue(self, binding=None):
      return (self.arguments[0].getvalue(binding) and
              self.arguments[1].getvalue(binding))

# this is "and", and 1 in the random_wff function
def wedge(x,y):
   return ['(' + x[0] + ' \\wedge ' + y[0] + ')', x[1] and y[1] ] 

class Vee(Node):
   def __init__(self, arguments):
      # Check number of arguments?
      self.arguments = arguments

   def display(self, binding=None, explain=False, doindent=False,
               stopdepth=0, _indentlevel=0):
      return self._explain(
         '(' +
         self.arguments[0].display(binding, explain, doindent,
                                   stopdepth, _indentlevel + 1) +
         ' \\vee ' +
         self.arguments[1].display(binding, explain, doindent,
                                   stopdepth, _indentlevel + 1) +
         ')', binding=binding, explain=explain, doindent=doindent,
              stopdepth=stopdepth, _indentlevel=_indentlevel)

   def getvalue(self, binding=None):
      return (self.arguments[0].getvalue(binding) or
              self.arguments[1].getvalue(binding))

# this is "or", and 2 in the random_wff function

def vee(x,y):
   return ['(' + x[0] + ' \\vee ' + y[0] +')', x[1] or y[1] ] 

class Nott(Node):
   def __init__(self, arguments):
      # Check number of arguments?
      self.arguments = arguments

   def display(self, binding=None, explain=False, doindent=False,
               stopdepth=0, _indentlevel=0):
      return self._explain(
         '\\neg(' +
         self.arguments[0].display(binding, explain, doindent,
                                   stopdepth, _indentlevel + 1) +
         ')', binding=binding, explain=explain, doindent=doindent,
              stopdepth=stopdepth, _indentlevel=_indentlevel)

   def getvalue(self, binding=None):
      return not self.arguments[0].getvalue(binding)

# this is "not", and 3 in the random_wff function

def nott(x):
   return ['\\neg(' + x[0] + ')', not x[1]]

class Implies(Node):
   def __init__(self, arguments):
      # Check number of arguments?
      self.arguments = arguments

   def display(self, binding=None, explain=False, doindent=False,
               stopdepth=0, _indentlevel=0):
      return self._explain(
         '(' +
         self.arguments[0].display(binding, explain, doindent,
                                   stopdepth, _indentlevel + 1) +
         ' \\implies ' +
         self.arguments[1].display(binding, explain, doindent,
                                   stopdepth, _indentlevel + 1) +
         ')', binding=binding, explain=explain, doindent=doindent,
              stopdepth=stopdepth, _indentlevel=_indentlevel)

   def getvalue(self, binding=None):
      return ((not self.arguments[0].getvalue(binding))
              or self.arguments[1].getvalue(binding))

# this is "implies", and 4 in the random_wff function
	
def implies(x,y):
   return ['(' + x[0] + ' \\implies ' + y[0] + ')', (not x[1]) or y[1] ] 

# this is "equivalence", and 5 in the random_wff function

class Leftrightarrow(Node):
   def __init__(self, arguments):
      # Check number of arguments?
      self.arguments = arguments

   def display(self, binding=None, explain=False, doindent=False,
               stopdepth=0, _indentlevel=0):
      return self._explain(
         '(' +
         self.arguments[0].display(binding, explain, doindent,
                                   stopdepth, _indentlevel + 1) +
         ' \\leftrightarrow ' +
         self.arguments[1].display(binding, explain, doindent,
                                   stopdepth, _indentlevel + 1) +
         ')', binding=binding, explain=explain, doindent=doindent,
              stopdepth=stopdepth, _indentlevel=_indentlevel)

   def getvalue(self, binding=None):
      left = self.arguments[0].getvalue(binding)
      right = self.arguments[1].getvalue(binding)
      return ((left and right) or ((not left) and (not right)))

class UniversalQuantifier(Node):
   def __init__(self, arguments, variable, universe):
      self.arguments = arguments
      self.variable = variable
      self.universe = universe

   def display(self, binding=None, explain=False, doindent=False,
               stopdepth=0, _indentlevel=0):
      return self._explain(
         'For all ' + self.variable + ': (' +
         self.arguments[0].display(binding, explain, doindent,
                                   stopdepth, _indentlevel + 1) +
         ')', binding=binding, explain=explain, doindent=doindent,
              stopdepth=stopdepth, _indentlevel=_indentlevel)

   def getvalue(self, binding=None):
      if binding is None:
         binding = {}
      for thing in self.universe:
         binding[self.variable] = thing
         if not self.arguments[0].getvalue(binding):
            return False
      return True

class ExistentialQuantifier(Node):
   def __init__(self, arguments, variable, universe):
      self.arguments = arguments
      self.variable = variable
      self.universe = universe

   def display(self, binding=None, explain=False, doindent=False,
               stopdepth=0, _indentlevel=0):
      return self._explain(
         'There exists ' + self.variable + ': (' +
         self.arguments[0].display(binding, explain, doindent,
                                   stopdepth, _indentlevel + 1) +
         ')', binding=binding, explain=explain, doindent=doindent,
              stopdepth=stopdepth, _indentlevel=_indentlevel)

   def getvalue(self, binding=None):
      if binding is None:
         binding = {}
      for thing in self.universe:
         binding[self.variable] = thing
         if self.arguments[0].getvalue(binding):
            return True
      return False

def random_map(universe, variables):
   if len(variables) == 1:
      map = {}
      for item in universe:
         map[item] = random.choice([True, False])
      return map
   else:
      map = {}
      for item in universe:
         child_map = random_map(universe, variables[1:])
         map[item] = child_map
      return map

def nested_get(d, key_list, default=None):
   if len(key_list) == 1:
      return d.get(key_list[0], default)
   else:
      return nested_get(d.get(key_list[0], default), key_list[1:], default)

class Predicate(Node):
   def __init__(self, universe, name, variables, map=None):
      self.arguments = []
      self.universe = universe
      self.name = name
      self.variables = variables
      if map:
         self.map = map
      else:
         self.map = random_map(universe, variables)

   def _explain(self, s, binding=None, explain=False, doindent=False,
                stopdepth=0, _indentlevel=0):
      if explain:
         display = ''
         if doindent:
            display = display + '\n' + ' ' * _indentlevel
         display = display + s
         if doindent:
            display = display + '\n' + ' ' * _indentlevel
         return display
      else:
         return s

   def display(self, binding=None, explain=False, doindent=False,
               stopdepth=0, _indentlevel=0):
      return self._explain(
         'Prop.' + self.name + '(' +
         ', '.join(self.variables) +
         ')', binding=binding, explain=explain, doindent=doindent,
              stopdepth=stopdepth, _indentlevel=_indentlevel)

   def getvalue(self, binding):
      keys = []
      for variable in self.variables:
         keys.append(binding[variable])
      return nested_get(self.map, keys)

def leftrightarrow(x,y):
   return ['(' + x[0] + ' \\leftrightarrow ' + y[0] + ')', ( x[1] and y[1]) or ((not x[1]) and (not y[1]))]
   
#creates a random wff (well-formed formula) using n of the above operations#   
def wff(n):
   if n==0:
      return random.choice([['T',True],['F',False]])
   else: 
      r = random.choice([1,2,3,4,5])
      if r==1:
         x = random.choice(range(0,n))
         return wedge(wff(x),wff(n-x-1))
      if r==2:
         x = random.choice(range(0,n))
         return vee(wff(x),wff(n-x-1))
      if r==3:
         return nott(wff(n-1))
      if r==4:
         x = random.choice(range(0,n))
         return implies(wff(x),wff(n-x-1))
      if r==5:
         x = random.choice(range(0,n))
         return leftrightarrow(wff(x),wff(n-x-1))
         
class TreeBuilder:
   def __init__(self):
      self.universe = (0, 1, 2)
      self._reset_defaults()
      self.predA = Predicate(self.universe, 'A', ('x',))
      self.predB = Predicate(self.universe, 'B', ('y',))
      self.predC = Predicate(self.universe, 'C', ('x', 'y'))

   # This may now be unnecessary, need to evaluate.
   def _reset_defaults(self):
      self.options = (1,2,3,4,5,6,7)

   def make_wff(self, n):
      root = self._build_wff(n)
      self._reset_defaults()
      return root

   def display(self):
      print(self.predA.name, 'on', ', '.join(self.predA.variables) + ':')
      pprint(self.predA.map)
      print(self.predB.name, 'on', ', '.join(self.predB.variables) + ':')
      pprint(self.predB.map)
      print(self.predC.name, 'on', ', '.join(self.predC.variables) + ':')
      pprint(self.predC.map)

   def _get_extra_options(self, var_name, options):
      if var_name == 'x':
         if 8 not in options:
            options = options + (8,)
         if 9 in options and 10 not in options:
            options = options + (10,)
      if var_name == 'y':
         if 9 not in options:
            options = options + (9,)
         if 8 in options and 10 not in options:
            options = options + (10,)
      return options

   def _build_wff(self, n, extra_options=tuple()):
      vs_choice = ('x', 'y')
      root = None
      if n == 0:
         root = random.choice([Value(True), Value(False)])
      else: 
         r = random.choice(self.options + extra_options)
         if r==1:
            x = random.choice(range(0,n))
            root = Wedge([self._build_wff(x, extra_options),
                          self._build_wff(n-x-1, extra_options)])
         if r==2:
            x = random.choice(range(0,n))
            root = Vee([self._build_wff(x, extra_options),
                        self._build_wff(n-x-1, extra_options)])
         if r==3:
            root = Nott([self._build_wff(n-1, extra_options)])
         if r==4:
            x = random.choice(range(0,n))
            root = Implies([self._build_wff(x, extra_options),
                            self._build_wff(n-x-1, extra_options)])
         if r==5:
            x = random.choice(range(0,n))
            root = Leftrightarrow([self._build_wff(x, extra_options),
                                   self._build_wff(n-x-1, extra_options)])
         if r==6:
            v = random.choice(vs_choice)
            extra_options = self._get_extra_options(v, extra_options)
            root = UniversalQuantifier(
               [self._build_wff(n - 1, extra_options)], v, self.universe)
         if r==7:
            v = random.choice(vs_choice)
            extra_options = self._get_extra_options(v, extra_options)
            root = ExistentialQuantifier(
               [self._build_wff(n - 1, extra_options)], v, self.universe)
         if r==8:
            root = self.predA
         if r==9:
            root = self.predB
         if r==10:
            root = self.predC

      return root


def wff2(n, vs=None):
   universe=(0, 1, 2)
   vs_choice = ('a', 'b')
   predicates = (8, 9)
   if n == 0:
      return random.choice([Value(True), Value(False)])
   else: 
      options = [1,2,3,4,5,6,7]
      if vs:
         options = options.append(vs)
      r = random.choice(options)
      if r==1:
         x = random.choice(range(0,n))
         return Wedge([wff2(x), wff2(n-x-1)])
      if r==2:
         x = random.choice(range(0,n))
         return Vee([wff2(x), wff2(n-x-1)])
      if r==3:
         return Nott([wff2(n-1)])
      if r==4:
         x = random.choice(range(0,n))
         return Implies([wff2(x), wff2(n-x-1)])
      if r==5:
         x = random.choice(range(0,n))
         return Leftrightarrow([wff2(x), wff2(n-x-1)])
      if r==6:
         v = random.choice(vs_choice)
         return UniversalQuantifier([wff2(n - 1)], v, universe)

def collapseLeaves(x):
   if isinstance(x,Value):
      return x
   if isinstance(x, Nott):
      if isinstance(x.arguments[0],Value):
         return Value(x.getvalue())
      else:
         return Nott([collapseLeaves(x.arguments[0])])
   if isinstance(x, Wedge):
      if isinstance(x.arguments[0],Value) and isinstance(x.arguments[1],Value):
         return Value(x.getvalue())
      else:
         return Wedge([collapseLeaves(x.arguments[0]),collapseLeaves(x.arguments[1])])
   if isinstance(x, Vee):
      if isinstance(x.arguments[0],Value) and isinstance(x.arguments[1],Value):
         return Value(x.getvalue())
      else:
         return Vee([collapseLeaves(x.arguments[0]),collapseLeaves(x.arguments[1])])
   if isinstance(x, Implies):
      if isinstance(x.arguments[0],Value) and isinstance(x.arguments[1],Value):
         return Value(x.getvalue())
      else:
         return Implies([collapseLeaves(x.arguments[0]),collapseLeaves(x.arguments[1])])
   if isinstance(x, Leftrightarrow):
      if isinstance(x.arguments[0],Value) and isinstance(x.arguments[1],Value):
         return Value(x.getvalue())
      else:
         return Leftrightarrow([collapseLeaves(x.arguments[0]),collapseLeaves(x.arguments[1])])

def printSolutions(x):
   print(x.display())
   if isinstance(x, Value) == False:
      printSolutions(collapseLeaves(x))
