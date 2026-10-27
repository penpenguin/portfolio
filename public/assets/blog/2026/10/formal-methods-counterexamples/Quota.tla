----------------------------- MODULE Quota -----------------------------
EXTENDS Naturals
CONSTANTS Clients, Cap, Atomic
VARIABLES served, phase
vars == <<served, phase>>

Init == /\ served = 0
        /\ phase = [c \in Clients |-> "new"]

Check(c) == /\ phase[c] = "new"
            /\ phase' = [phase EXCEPT ![c] =
                             IF served < Cap THEN "approved" ELSE "done"]
            /\ UNCHANGED served

Record(c) == /\ phase[c] = "approved"
             /\ served' = served + 1
             /\ phase' = [phase EXCEPT ![c] = "done"]

Reserve(c) == /\ phase[c] = "new"
              /\ served' = IF served < Cap THEN served + 1 ELSE served
              /\ phase' = [phase EXCEPT ![c] = "done"]

Next == \/ (\E c \in Clients :
                IF Atomic THEN Reserve(c) ELSE Check(c) \/ Record(c))
        \/ (/\ \A c \in Clients : phase[c] = "done"
            /\ UNCHANGED vars)

TypeOK == /\ served \in Nat
          /\ phase \in [Clients -> {"new", "approved", "done"}]
NeverOverCap == served <= Cap
=============================================================================
