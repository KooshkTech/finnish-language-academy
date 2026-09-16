import type { SupabaseClient } from '@supabase/supabase-js'
type FeedEvent={classId:string;authorUserId:string;courseLanguage:'fi'|'sv';postType:'lesson'|'session';title:string;body:string;linkPath?:string|null}
export async function publishAutomaticFeedPost(admin:SupabaseClient,event:FeedEvent){return admin.from('class_feed_posts').insert({class_id:event.classId,author_user_id:event.authorUserId,course_language:event.courseLanguage,post_type:event.postType,title:event.title,body:event.body,link_path:event.linkPath??null,is_pinned:false,comments_enabled:true})}

