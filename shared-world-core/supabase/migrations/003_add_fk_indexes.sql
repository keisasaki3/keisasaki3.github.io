-- Cover foreign keys reported by Supabase performance advisor.
create index profiles_race_id_idx
  on public.profiles(race_id)
  where race_id is not null;

create index quest_topic_mastery_topic_id_idx
  on public.quest_topic_mastery(topic_id);
