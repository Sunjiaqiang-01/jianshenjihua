/**
 * 动作演示素材 —— 全站统一一套：SmartWorkout 的 3D 解剖示范。
 *
 * 来源：smartworkout.app 健身练习库
 * 内容：同一个 3D 人体模型、同样的深色背景、6 秒循环；
 *       目标肌群在动作中实时红色高亮，跟右侧肌肉图一一对应。
 * 处理：原片 1920×1080 → 本地转码 1280×720（约 110KB/个），另存首帧做封面。
 */

export function demoFor(exercise) {
  const id = typeof exercise === 'string' ? exercise : (exercise.media || exercise.id)
  return {
    video: `/media/sw/${id}.mp4`,
    poster: `/media/sw/${id}.jpg`,
  }
}
