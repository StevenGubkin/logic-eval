#This program will generate latex code for random wff involving $T$,
#$F$, $\wedge$ (and), $\vee$ (or), $\neg$ (not), $\implies$ , and
#$\Leftrightarrow$. It will also keep track of whether that wff is true
#or false so I can ask a student that question. I will think of a wff as
#an array of [tex,truth value].  For instance, [T \implies F, 0] would
#be a valid wff.  I will build these recursively.
import random

# this is "and", and 1 in the random_wff function
def wedge(x,y):
   return ['('+ x[0] + ' \\wedge ' + y[0]+')', x[1] and y[1] ] 

# this is "or", and 2 in the random_wff function

def vee(x,y):
   return ['('+ x[0] + ' \\vee ' + y[0]+')', x[1] or y[1] ] 

# this is "not", and 3 in the random_wff function

def nott(x):
   return ['\\neg('+x[0]+')', not x[1]]

# this is "implies", and 4 in the random_wff function
	
def implies(x,y):
   return ['('+ x[0] + ' \\implies ' + y[0]+')', (not x[1]) or y[1] ] 

# this is "equivalence", and 5 in the random_wff function

def leftrightarrow(x,y):
   return ['('+ x[0] + ' \\leftrightarrow ' + y[0]+')', ( x[1] and y[1]) or ((not x[1]) and (not y[1]))]
   
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
         
         