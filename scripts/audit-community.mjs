import fs from 'node:fs'
const migration=fs.readFileSync('supabase/migrations/20260915120000_class_feed_learning_path.sql','utf8')
for(const token of ['class_feed_posts','class_feed_comments','class_feed_reactions','student_weekly_goals','enable row level security','class_feed_post','class_feed_comment'])if(!migration.includes(token)){console.error(`Missing migration token: ${token}`);process.exit(1)}
for(const file of ['components/community/ClassFeedPostForm.tsx','components/community/FeedInteractions.tsx','components/community/WeeklyGoalForm.tsx','app/api/teacher/classes/[classId]/feed/route.ts','app/api/student/classes/[classId]/feed/[postId]/comments/route.ts','app/api/student/classes/[classId]/feed/[postId]/reaction/route.ts','app/api/student/learning-path/weekly-goal/route.ts'])if(!fs.existsSync(file)){console.error(`Missing V24.17 file: ${file}`);process.exit(1)}
console.log('V24.17 community feed and learning path audit passed.')


