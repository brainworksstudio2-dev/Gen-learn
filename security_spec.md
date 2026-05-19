# Security Specification - GEN Academy

## Data Invariants
1. **Student Isolation**: Students can only read and write their own submissions and profiles.
2. **Global Readables**: Assignments, Materials, and Roadmap items are readable by all authenticated users (students of that cohort or admins).
3. **Admin Supremacy**: Users with the `admin` role (determined by `users` collection lookup) have full access to management tools.
4. **Cohort Scoping**: Students should ideally only list data relevant to their `gen` or where `gen == 'all'`.
5. **No Self-Promotion**: Students cannot change their own `role` field to `admin`.

## The "Dirty Dozen" Payloads (Wicked Writes)

1. **The Chameleon**: A student tries to update their profile and set `role: 'admin'`.
2. **The Voyeur**: A student tries to `get` another student's submission.
3. **The Saboteur**: A student tries to `delete` an assignment.
4. **The Ghost Writer**: A student tries to submit an assignment on behalf of another student (`student_id` mismatch).
5. **The Grade Hacker**: A student tries to update their own submission's `score` or `status` to 'graded'.
6. **The Material Thief**: An unauthenticated user tries to read materials.
7. **The Roadmap Jumpper**: A student tries to create a new Roadmap module.
8. **The Attendance Spoofer**: A student tries to mark themselves present for a future date.
9. **The Shadow Field**: An admin tries to create an assignment with extra hidden fields (e.g., `is_internal: true`).
10. **The ID Poisoner**: An attacker tries to create a collection with a document ID that is a 1KB string of random characters.
11. **The Retro-Active Editor**: A student tries to update a submission that has already been marked as 'graded'.
12. **The Anonymous Intruder**: An unauthenticated user tries to write to the `users` collection.

## Test Strategy
We will use the rules to block all the above.
