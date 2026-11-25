/**
 * 动作素材：知识库 SmartWorkout 动作库的循环短片，6 秒一圈，深底、同一具人体模型，
 * 目标肌群在动作里自身高亮。每段 77–117KB，另存首帧做封面。
 * 文件名就是动作 id；少数动作用 media 字段指到同一段。
 */
export function mediaKey(exercise) {
  return typeof exercise === 'string' ? exercise : (exercise.media || exercise.id)
}

export function videoFor(exercise) {
  const key = mediaKey(exercise)
  return { video: `/media/sw/${key}.mp4`, poster: `/media/sw/${key}.jpg` }
}
