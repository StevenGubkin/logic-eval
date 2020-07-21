#This program will generate latex code for random wff involving $T$,
#$F$, $\wedge$ (and), $\vee$ (or), $\neg$ (not), $\implies$ , and
#$\Leftrightarrow$. It will also keep track of whether that wff is true
#or false so I can ask a student that question. I will think of a wff as
#an array of [tex,truth value].  For instance, [T \implies F, 0] would
#be a valid wff.  I will build these recursively.
import random

class Node:
   def __init__(self):
      self.arguments = []

   def _explain(self, s, explain=False, withdepth=False, depth=0):
      if explain:
         display = ''
         if withdepth:
            display = display + '\n' + ' ' * depth
         display = display + s
         if withdepth:
            display = display + ' # value: ' + str(self.getvalue()) + '\n'
         else:
            display = display + ' [value: ' + str(self.getvalue()) + ']'
         return display
      else:
         return s

class Value(Node):
   def __init__(self, value):
      self._value = value

   def display(self, explain=False, withdepth=False, depth=0):
      if self._value:
         return 'T'
      else:
         return 'F'

   def getvalue(self):
      return self._value

class Wedge(Node):
   def __init__(self, arguments):
      # Check number of arguments?
      self.arguments = arguments

   def display(self, explain=False, withdepth=False, depth=0):
      return self._explain(
         '(' +
         self.arguments[0].display(explain, withdepth, depth + 1) +
         ' \\wedge ' +
         self.arguments[1].display(explain, withdepth, depth + 1) +
         ')', explain, withdepth, depth)

   def getvalue(self):
      return self.arguments[0].getvalue() and self.arguments[1].getvalue()

# this is "and", and 1 in the random_wff function
def wedge(x,y):
   return ['(' + x[0] + ' \\wedge ' + y[0] + ')', x[1] and y[1] ] 

class Vee(Node):
   def __init__(self, arguments):
      # Check number of arguments?
      self.arguments = arguments

   def display(self, explain=False, withdepth=False, depth=0):
      return self._explain(
         '(' +
         self.arguments[0].display(explain, withdepth, depth + 1) +
         ' \\vee ' +
         self.arguments[1].display(explain, withdepth, depth + 1) +
         ')', explain, withdepth, depth)

   def getvalue(self):
      return self.arguments[0].getvalue() or self.arguments[1].getvalue()

# this is "or", and 2 in the random_wff function

def vee(x,y):
   return ['(' + x[0] + ' \\vee ' + y[0] +')', x[1] or y[1] ] 

class Nott(Node):
   def __init__(self, arguments):
      # Check number of arguments?
      self.arguments = arguments

   def display(self, explain=False, withdepth=False, depth=0):
      return self._explain(
         '\\neg(' +
         self.arguments[0].display(explain, withdepth, depth + 1) +
         ')', explain, withdepth, depth)

   def getvalue(self):
      return not self.arguments[0].getvalue()

# this is "not", and 3 in the random_wff function

def nott(x):
   return ['\\neg(' + x[0] + ')', not x[1]]

class Implies(Node):
   def __init__(self, arguments):
      # Check number of arguments?
      self.arguments = arguments

   def display(self, explain=False, withdepth=False, depth=0):
      return self._explain(
         '(' +
         self.arguments[0].display(explain, withdepth, depth + 1) +
         ' \\implies ' +
         self.arguments[1].display(explain, withdepth, depth + 1) +
         ')', explain, withdepth, depth)

   def getvalue(self):
      return ((not self.arguments[0].getvalue())
              or self.arguments[1].getvalue())

# this is "implies", and 4 in the random_wff function
	
def implies(x,y):
   return ['(' + x[0] + ' \\implies ' + y[0] + ')', (not x[1]) or y[1] ] 

# this is "equivalence", and 5 in the random_wff function

class Leftrightarrow(Node):
   def __init__(self, arguments):
      # Check number of arguments?
      self.arguments = arguments

   def display(self, explain=False, withdepth=False, depth=0):
      return self._explain(
         '(' +
         self.arguments[0].display(explain, withdepth, depth + 1) +
         ' \\leftrightarrow ' +
         self.arguments[1].display(explain, withdepth, depth + 1) +
         ')', explain, withdepth, depth)

   def getvalue(self):
      left = self.arguments[0].getvalue()
      right = self.arguments[1].getvalue()
      return ((left and right) or ((not left) and (not right)))

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
         
         
def wff2(n):
   if n == 0:
      return random.choice([Value(True), Value(False)])
   else: 
      r = random.choice([1,2,3,4,5])
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
