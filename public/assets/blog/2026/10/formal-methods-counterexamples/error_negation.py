# Educational model: an error must never grant access, even when negated.
# Run: uv run --python 3.11 --with z3-solver==5.3.2.0 error_negation.py
from z3 import And, Bools, If, Not, Solver, is_true, sat, unsat

ok, match, invert = Bools("ok match invert")
collapsed = And(ok, match)
broken = If(invert, Not(collapsed), collapsed)
fixed = And(ok, If(invert, Not(match), match))

for name, allowed, expected in (
    ("broken", broken, sat),
    ("fixed", fixed, unsat),
):
    solver = Solver()
    solver.add(Not(ok), allowed)
    result = solver.check()
    print(f"{name}: {result}")
    if result != expected:
        raise AssertionError(f"{name}: expected {expected}, got {result}")
    if result == sat:
        model = solver.model()
        values = [
            f"{var}={str(is_true(model.eval(var, model_completion=True))).lower()}"
            for var in (ok, match, invert)
        ]
        print("  " + ", ".join(values))
