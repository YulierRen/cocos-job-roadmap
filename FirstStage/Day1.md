## Day 1 任务总览（学习 + 产出）

## 一、学习任务（2~3 小时）

1. **Cocos 3.x 生命周期与工程结构复盘（30min）**
   - 复习：`onLoad / start / update / onEnable / onDisable / onDestroy`
   - 明确你后续统一目录规范（下面给你模板）

2. **TS 在游戏开发中的高频写法（60min）**
   - interface + type 用法边界
   - 泛型在“事件总线/对象池”里的应用
   - 单例、工厂、模块化拆分

3. **性能基础意识（30~45min）**
   - 节点复用 vs 频繁创建销毁
   - 减少不必要 update
   - UI 层级与重绘意识

---

## 二、实战开发任务（4~6 小时）

你今天做一个：  
**《可复用 UI 框架最小 Demo》**（后续所有项目都复用）

### 必做功能
1. `UIRoot`（统一管理弹窗层级）
2. `UIManager`（打开/关闭/缓存界面）
3. `EventBus`（模块通信）
4. 两个界面：
   - `MainUI`（主界面，两个按钮）
   - `PopupUI`（弹窗，显示文本 + 关闭按钮）

### 技术要求
- 全部 TypeScript
- 禁止把逻辑写在一个脚本里
- 用事件驱动打开弹窗（不要 MainUI 直接硬引用 PopupUI 逻辑）
- 加一处“简单对象池思想”（比如弹窗关闭不销毁，只隐藏缓存）

---

## 三、目录结构（今天就按这个来）

```text
assets/
  scripts/
    core/
      EventBus.ts
      UIManager.ts
      UIRoot.ts
      Types.ts
    ui/
      MainUI.ts
      PopupUI.ts
    game/
      GameEntry.ts
```

---

## 四、今天必须交付的“产出物”

1. **可运行 Demo**（能打开/关闭弹窗）
2. **架构说明文档 1 份**（Markdown，300~500字）
   - 为什么要 EventBus
   - 为什么 UIManager 要做缓存
3. **复盘日志 1 份**
   - 今日完成
   - 遇到的问题
   - 明日计划

---

## 五、验收标准（完成线）

满足以下 6 条就算 Day1 合格：

- [ ] MainUI 按钮可打开 Popup  
- [ ] Popup 可关闭且再次打开正常  
- [ ] Popup 关闭后不销毁（缓存复用）  
- [ ] 有 EventBus 并至少用了 2 个事件  
- [ ] 目录结构清晰、脚本职责单一  
- [ ] 有 README（写明如何运行 + 架构说明）

---

## 六、加分项（可选，1 小时内）

- 给 UIManager 增加 `open(name, data?)` 参数透传
- Popup 显示传入内容（例如“今天是 Day1”）
- 记录一次打开耗时（为以后性能报告埋点）

---

你今天做完后，把这三样发我（可文字描述）：
1. 目录结构  
2. 关键类职责  
3. 你遇到的1~2个问题  

我会给你做 **Day 1 Review**，然后发 **Day 2 任务**（进入“配置驱动 + 轻业务系统”）。
