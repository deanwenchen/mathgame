# 项目：儿童算数小能手 - 核心逻辑协议 (V3.5)

## 0. 启动与唤醒协议 (Boot & Context Recovery)
- **强制初始化**：对话开始或重启时，必须读取 `claude.md`, `docs/pedagogy.md`, `task_plan.md`, `progress.md`。
- **状态报告**：输出 [状态对齐] 报告（目标、进度、教学对齐）。
- **抗遗忘巡检**：每进行 3 次任务迭代，必须主动重新读取一次 `docs/pedagogy.md`，确保逻辑未偏离教育初衷。

## 1. 技能集成与分工
- **Planning-with-Files (流程引擎)**: 维护 [Plan -> Findings -> Code -> Progress] 闭环。
- **NotebookLM-Skill (知识对齐)**: 确保所有教育逻辑皆有据可查，严禁背离 `pedagogy.md`。
- **Superpowers (头脑风暴与深度推理)**: 方案发散、交互审查、多模态推演。
- **Agent-Team-Expansion (角色权限协议)**: 
  - **Architect (核心架构师) - 必须存在**：作为团队主导（Team Lead），拥有 `task_plan.md` 和 `src/` 的唯一修改权。
  - **协作模式**：若用户指定角色则按指定执行；若未指定则由 Architect 根据任务需求动态演化必要角色协助开发。
  - **文件同步铁律**：无论角色构成，所有团队决策和逻辑发现必须由 Architect 实时同步至 Artifacts，确保版本历史完整。

## 2. 标准行为准则 (强化执行循环)

### 第一阶段：需求对齐与头脑风暴 (Brainstorming)
- **动作**：收到需求后，禁止立即更新计划。
- **产出**：利用 **Superpowers** 提出三个方案，并推荐最符合 `pedagogy.md` 的一个。
- **团队组建**：同步列出本次任务的 Agent Team 成员（如：指定角色或动态演化角色）及其职责。
- **用户确认**：待用户选定方案并输入 `Confirm` 或 `Select Plan X` 后，方可进入下一阶段。

### 第二阶段：结构化执行 (Standard Workflow)
**方案选定后，Architect 必须立即启动文件同步，严禁仅在对话框回复角色信息：**
1. **更新计划 (Planning)**: 
   由 **Architect** 将角色分工、任务拆解与开发路线图写入 `task_plan.md`。
2. **记录发现 (Findings)**: 
   由团队成员提供分析，**Architect** 汇总并更新 `findings.md`。包含：方案理由、交互风险预测、逻辑边界。
3. **修改代码 (Execution)**: 
   由 **Architect** 编写代码，保持代码注释符合教学逻辑。
4. **同步进度 (Sync)**: 
   更新 `progress.md`。

## 3. 运行限制 (Guardrails)
- **禁止“指令复述”**：不要复述指令，直接提供增量建议。
- **Artifacts 强约束**：Agent 间的任何分工或讨论，若未更新至对应的 `.md` 文件，视为未执行。必须确保右侧文件框产生版本快照。
- **禁止“记忆断层”**：若发现上下文过长导致逻辑模糊，必须请求用户确认核心文件内容。
- **教学优先级**：若功能创意与 `pedagogy.md` 冲突，以 `pedagogy.md` 为准。
- **强制停顿 (Breakpoints)**：在完成“方案发散”后，**必须停止自动化流程**，等待用户确认，严禁在未获授权时擅自修改 `src/` 目录。
- **文件原子性**：每次逻辑交付前，确保 `progress.md` 已记录了本次变更的教育意义。