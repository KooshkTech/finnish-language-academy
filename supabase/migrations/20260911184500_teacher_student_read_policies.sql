-- Teachers can read only students connected through their own classes.
DROP POLICY IF EXISTS profiles_teacher_class_select ON public.profiles;
CREATE POLICY profiles_teacher_class_select ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.teacher_class_members m
    JOIN public.teacher_classes c ON c.id = m.class_id
    WHERE m.student_id = profiles.id
      AND c.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS lesson_progress_teacher_class_select ON public.lesson_progress;
CREATE POLICY lesson_progress_teacher_class_select ON public.lesson_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.teacher_class_members m
    JOIN public.teacher_classes c ON c.id = m.class_id
    WHERE m.student_id = lesson_progress.user_id
      AND c.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS exercise_attempts_teacher_class_select ON public.exercise_attempts;
CREATE POLICY exercise_attempts_teacher_class_select ON public.exercise_attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.teacher_class_members m
    JOIN public.teacher_classes c ON c.id = m.class_id
    WHERE m.student_id = exercise_attempts.user_id
      AND c.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS vocabulary_progress_teacher_class_select ON public.vocabulary_progress;
CREATE POLICY vocabulary_progress_teacher_class_select ON public.vocabulary_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.teacher_class_members m
    JOIN public.teacher_classes c ON c.id = m.class_id
    WHERE m.student_id = vocabulary_progress.user_id
      AND c.teacher_id = auth.uid()
  )
);
