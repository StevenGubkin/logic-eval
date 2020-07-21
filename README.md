# logic-eval
This web application creates expressions in sentential and predicate logic and asks students to evaluate their truth value.

For instance, a student might be asked to evaluate the truth value of (F -> T) & ((F or T) -> T)

Or a student might be given a universe of discourse U = {a,b,c} and a predicate P(x) defined by P(a)=T, P(b) = T, and P(c) = F, and be asked to evaluate the truth value of

  forall x ((P(x) and T) implies (exists y (not(P(y)) )))
