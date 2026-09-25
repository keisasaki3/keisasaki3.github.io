# Generated curriculum seeds

`002_math_curriculum.sql` is generated from the current Life Quest public app data.

From repository root:

```bash
python shared-world-core/scripts/generate_math_seed.py
```

Expected current result:

- 20 math fields
- 275 math topics

The initial generation assigns stable topic IDs. After these IDs are deployed and user mastery exists, do not casually regenerate IDs from a reordered list. Treat published `topic_id` values as immutable identifiers; future tooling should preserve existing IDs across display-name/order changes.

Before applying to Supabase:

1. Apply `../migrations/001_initial_schema.sql`
2. Apply `../seed.sql` (races + 29 subjects)
3. Generate/apply `002_math_curriculum.sql`
