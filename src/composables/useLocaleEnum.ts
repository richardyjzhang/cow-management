import { useI18n } from 'vue-i18n'

/** mock/业务里仍用中文枚举值时，在界面上转为当前语言的标签 */
export function useLocaleEnum() {
  const { t } = useI18n()

  function taskStatus(s: string) {
    const m: Record<string, string> = {
      待办: 'enum.task.todo',
      进行中: 'enum.task.doing',
      已完成: 'enum.task.done',
      已取消: 'enum.task.cancelled',
    }
    return t(m[s] ?? s)
  }

  function taskPriority(s: string) {
    const m: Record<string, string> = {
      高: 'enum.priority.high',
      中: 'enum.priority.mid',
      低: 'enum.priority.low',
    }
    return t(m[s] ?? s)
  }

  function userStatus(s: string) {
    const m: Record<string, string> = {
      启用: 'enum.user.enabled',
      禁用: 'enum.user.disabled',
    }
    return t(m[s] ?? s)
  }

  function reportStatus(s: string) {
    const m: Record<string, string> = {
      待生成: 'enum.report.pending',
      生成中: 'enum.report.generating',
      已完成: 'enum.report.done',
      失败: 'enum.report.failed',
    }
    return t(m[s] ?? s)
  }

  function auditStatus(s: string) {
    const m: Record<string, string> = {
      待审核: 'enum.audit.pending',
      已通过: 'enum.audit.passed',
      已驳回: 'enum.audit.rejected',
    }
    return t(m[s] ?? s)
  }

  function qrcodeStatus(s: string) {
    const m: Record<string, string> = {
      有效: 'enum.qrcode.valid',
      已失效: 'enum.qrcode.invalid',
    }
    return t(m[s] ?? s)
  }

  function eartagStatus(s: string) {
    const m: Record<string, string> = {
      在库: 'enum.eartag.inStock',
      已绑定: 'enum.eartag.bound',
      作废: 'enum.eartag.voided',
    }
    return t(m[s] ?? s)
  }

  return { taskStatus, taskPriority, userStatus, reportStatus, auditStatus, qrcodeStatus, eartagStatus }
}
